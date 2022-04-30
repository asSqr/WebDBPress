use std::cell::{Ref, RefMut};
use std::convert::identity;
use std::rc::Rc;

use bincode::Options;
use serde::{Deserialize, Serialize};
use thiserror::Error;
use zerocopy::{AsBytes, ByteSlice};

use crate::buffer::{self, Buffer, BufferPoolManager};
use crate::disk::PageId;

mod branch;
mod leaf;
mod meta;
mod node;

#[derive(Serialize, Deserialize)]
pub struct Pair<'a> {
    pub key: &'a [u8],
    pub value: &'a [u8],
}

impl<'a> Pair<'a> {

    fn to_bytes(&self) -> Vec<u8> {
        bincode::options().serialize(self).unwrap()
    }

    fn from_bytes(bytes: &'a [u8]) -> Self {
        bincode::options().deserialize(bytes).unwrap()
    }

}

#[derive(Debug, Error)]
pub enum Error {
    #[error("duplicate key")]
    DuplicateKey,
    #[error(transparent)]
    Buffer(#[from] buffer::Error),
}

#[derive(Debug, Clone)]
pub enum SearchMode {
    Start,
    Key(Vec<u8>),
}

impl SearchMode {

    fn child_page_id(&self, branch: &branch::Branch<impl ByteSlice>) -> PageId {
        match self {
            SearchMode::Start => branch.child_at(0),
            SearchMode::Key(key) => branch.search_child(key),
        }
    }

    fn tuple_slot_id(&self, leaf: &leaf::Leaf<impl ByteSlice>) -> Result<usize, usize> {
        match self {
            SearchMode::Start => Err(0),
            SearchMode::Key(key) => leaf.search_slot_id(key),
        }
    }

}

pub struct BTree {
    pub meta_page_id: PageId,
}

impl BTree {
    
    pub fn create(bufmgr: &mut BufferPoolManager) -> Result<Self, Error> {
        let meta_buffer = bufmgr.create_page()?;
        let mut meta = meta::Meta::new(meta_buffer.page.borrow_mut() as RefMut<[_]>);
        let root_buffer = bufmgr.create_page()?;
        let mut root = node::Node::new(root_buffer.page.borrow_mut() as RefMut<[_]>);

        root.initialize_as_leaf();

        let mut leaf = leaf::Leaf::new(root.body);
        leaf.initialize();

        meta.header.root_page_id = root_buffer.page_id;

        Ok(Self::new(meta_buffer.pageid))
    }

    pub fn new(meta_page_id: PageId) -> Self {
        Self { meta_page_id }
    }

    fn fetch_root_page(&self, bufmgr: &mut BufferPoolManager) -> Result<Rc<Buffer>, Error> {
        let root_page_id = {
            let meta_buffer = bufmgr.fetch_page(self.meta_page_id)?;
            let meta = meta::Meta::new(meta_buffer.page.borrow() as Ref<[_]>);
            meta.header.root_page_id
        }

        Ok(bufmgr.fetch_page(root_page_id)?)
    }

    fn search_internal(
        &self,
        bufmgr: &mut BufferPoolManager,
        node_buffer: Rc<Buffer>,
        search_mode: SearchMode,
    ) -> Result<Iter, Error> {
        let node = node::Node::new(node_buffer.page.borrow() as Ref<[_]>);

        match node::Body::new(node.header.node_type, node.body.as_bytes()) {
            node::Body::Leaf(leaf) => {
                let slot_id = search_mode.tuple_slot_id(&leaf).unwrap_or_else(identity);
                let is_right_most = leaf.num_pairs() == slot_id;
                drop(node);

                let mut iter = Iter {
                    buffer: node_buffer,
                    slot_id,
                }

                if is_right_most {
                    iter.advance(bufmgr)?;
                }

                Ok(iter)
            }
            node::Body::Branch(branch) => {
                let child_page_id = search_mode.child_page_id(&branch);
                drop(node);
                drop(node_buffer);
                
                let child_node_page = bufmgr.fetch_page(child_page_id)?;
                self.search_internal(bufmgr, child_node_page, search_mode)
            }
        }
    }

    pub fn search(
        &self,
        bufmgr: &mut BufferPoolManager,
        search_mode: SearchMode,
    ) -> Result<Iter, Error> {
        let root_page = self.fetch_root_page(bufmgr)?;
        self.search_internal(bufmgr, root_page, search_mode)
    }

}

pub struct Iter {
    buffer: Rc<Buffer>,
    slot_id: usize,
}

impl Iter {
    fn get(&self) -> Option<(Vec<u8>, Vec<u8>)> {
        let leaf_node = node::Node::new(self.buffer.page.borrow as Ref<[_]>);
        let leaf = leaf::Leaf::new(leaf_node.body);

        if self.slot_id < leaf.num_pairs() {
            let pair = leaf.pair_at(self.slot_id);

            Some((pair.key.to_vec(), pair.value.to_vec()))
        } else {
            None
        }
    }

    fn advance(&mut self, bufmgr: &mut BufferPoolManager) -> Result<(), Error> {
        self.slot_id += 1;

        let next_page_id = {
            let leaf_node = node::Node::new(self.buffer.page.borrow() as Ref<[_]>);
            let leaf = leaf::Leaf::new(leaf_node.body);

            if self.slot_id < leaf.num_pairs() {
                return Ok(());
            }

            leaf.next_page_id()
        };

        if let Some(next_page_id) = next_page_id {
            self.buffer = bufmgr.fetch_page(next_page_id)?;
            self.slot_id = 0;
        }

        Ok(())
    }

    #[allow(clippy::type_complexity)]
    pub fn next(
        &mut self,
        bufmgr: &mut BufferPoolManager,
    ) -> Result<Option<(Vec<u8>, Vec<u8>)>, Error> {
        let value = self.get();
        self.advance(bufmgr)?;
        Ok(value)
    }
}
