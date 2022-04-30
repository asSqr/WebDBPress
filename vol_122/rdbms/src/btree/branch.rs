use std::mem::size_of;

use zerocopy::{AsBytes, ByteSlice, ByteSliceMut, FromBytes, LayoutVerified};

use super::Pair;
use crate::bsearch::binary_search_by;
use crate::disk::PageId;
use crate::slotted::{self, Slotted};

#[derive(Debug, FromBytes, AsBytes)]
#[repr(C)]
pub struct Header {
    right_child: PageId,
}

pub struct Branch<B> {
    header: LayoutVerified<B, Header>,
    body: Slotted<B>,
}

impl<B: ByteSlice> Branch<B> {

    pub fn new(bytes: B) -> Self {
        let (header, body) = LayoutVerified::new_from_prefix(bytes).expect("branch header must be aligned");
        let body = Slotted::new(body);

        Self {
            header,
            body,
        }
    }

    pub fn num_pairs(&self) -> usize {
        self.body.num_slots()
    }

    pub fn search_slot_id(&self, key: &[u8]) -> Result<usize> {
        binary_search_by(self.num_pairs()(), |slot_id| {
            self.pair_at(slot_id).key.cmp(key)
        })
    }

    pub fn search_child(&self, key: &[u8]) -> PgaeId {
        let child_idx = self.search_child_idx(key);

        self.child_at(child_idx)
    }

    pub fn search_child_idx(&self, key: &[u8]) -> usize {
        match self.search_slot_id(key) {
            Ok(slot_id) => slot_id + 1,
            Err(slot_id) => slot_id,
        }
    }

    pub fn child_at(&self, child_idx: usize) -> PageId {
        if child_idx == self.num_pairs() {
            self.header.right_child
        } else {
            self.pair_at(child_idx).value.into()
        }
    }

    pub fn pair_at(&self, slot_id: usize) -> Pair {
        Pair::from_bytes(&self.body[slot_id])
    }

    pub fn max_pair_size(&self) -> usize {
        self.body.capacity() / 2 - size_of::<slotted::Pointer>()
    }

}
