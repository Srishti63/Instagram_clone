export class Node {
    constructor(key, value) {
      this.key = key;
      this.value = value;
      this.prev = null;
      this.next = null;
    }
  }
  
  export class DoublyLinkedList {
    constructor() {
      this.head = null;
      this.tail = null;
      this.size = 0;
    }
  
    // Move an existing node to the front (O(1))
    moveToFront(node) {
      if (this.head === node) return; // Already at head
  
      // Detach node
      if (node.prev) node.prev.next = node.next;
      if (node.next) node.next.prev = node.prev;
      
      // If it was the tail, update tail
      if (this.tail === node) {
        if (node.prev) {
          this.tail = node.prev;
        } else {
          this.tail = null;
        }
      }
  
      // Attach to head
      node.prev = null;
      node.next = this.head;
      if (this.head) this.head.prev = node;
      this.head = node;
  
      if (!this.tail) this.tail = node;
    }
  
    // Push new node to the back (useful for initial sorted data load)
    pushBack(node) {
      node.next = null;
      node.prev = this.tail;
      if (this.tail) this.tail.next = node;
      this.tail = node;
      if (!this.head) this.head = node;
      this.size++;
    }
  
    // Convert DLL to standard Array for React rendering O(N)
    toArray() {
      const arr = [];
      let current = this.head;
      while (current) {
        arr.push(current.value);
        current = current.next;
      }
      return arr;
    }
  }
