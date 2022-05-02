use std::mem::size_of;

use zerocopy::{AsBytes, ByteSlice, ByteSliceMut, FromBytes, LayoutVerified};

use super::Pair;
use crate::bsearch::binary_search_by;
use crate::disk::PageId;
use crate::slotted::{self, Slotted};

#[derive(Debug, FromBytes, AsBytes)]
#[repr(C)]
pub struct Header {
    prev_page_id: PageId,
    next_page_id: PageId,
}

pub struct Leaf<B> {
    header: LayoutVerified<B, Header>,
    body: Slotted<B>,
}

impl<B: ByteSlice> Leaf<B> {

    pub fn new(bytes: B) -> Self {
        
    }

}
