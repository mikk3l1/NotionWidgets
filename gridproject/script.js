document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const addElementBtn = document.getElementById('addElement');
    const elementSizeSelect = document.getElementById('elementSize');
    
    let elementCounter = 1;
    let draggedElement = null;
    let currentResizeElement = null;
    let offset = { x: 0, y: 0 };
    let gridRect = grid.getBoundingClientRect();
    let cellSize = { 
        width: gridRect.width / 12, 
        height: 50 
    };
    
    // Function to create a grid element
    function createGridElement(size) {
        const element = document.createElement('div');
        element.className = 'grid-item';
        element.setAttribute('data-size', size);
        element.textContent = elementCounter++;
        
        // Convert size to pixels
        const width = size * cellSize.width;
        const height = size * cellSize.height;
        
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
        
        // Add resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        element.appendChild(resizeHandle);
        
        // Calculate grid's position relative to viewport
        const computedStyle = window.getComputedStyle(grid);
        const paddingTop = parseInt(computedStyle.paddingTop);
        const paddingLeft = parseInt(computedStyle.paddingLeft);
        
        // Position at the top-left corner of the grid's content area
        element.style.left = `${paddingLeft}px`;
        element.style.top = `${paddingTop}px`;
        
        // Make the element draggable
        element.addEventListener('mousedown', startDrag);
        
        // Add event listeners for resizing
        resizeHandle.addEventListener('mousedown', startResize);
        
        return element;
    }
    
    // Add a new element when the Add Element button is clicked
    addElementBtn.addEventListener('click', () => {
        const size = parseInt(elementSizeSelect.value);
        const newElement = createGridElement(size);
        grid.appendChild(newElement);
    });
    
    // Check if two elements overlap
    function elementsOverlap(element1Rect, element2Rect) {
        return !(
            element1Rect.right <= element2Rect.left ||
            element1Rect.left >= element2Rect.right ||
            element1Rect.bottom <= element2Rect.top ||
            element1Rect.top >= element2Rect.bottom
        );
    }
    
    // Check if an element would overlap with any other elements at the given position
    function wouldOverlap(element, left, top, width, height) {
        const testRect = {
            left: left,
            top: top,
            right: left + width,
            bottom: top + height
        };
        
        const elements = Array.from(grid.querySelectorAll('.grid-item')).filter(el => el !== element);
        
        for (let el of elements) {
            const elRect = {
                left: parseInt(el.style.left),
                top: parseInt(el.style.top),
                right: parseInt(el.style.left) + el.offsetWidth,
                bottom: parseInt(el.style.top) + el.offsetHeight
            };
            
            if (elementsOverlap(testRect, elRect)) {
                return true;
            }
        }
        
        return false;
    }
    
    // Drag functionality
    function startDrag(e) {
        // Ignore if we clicked on the resize handle
        if (e.target.className === 'resize-handle') return;
        
        draggedElement = this;
        draggedElement.classList.add('dragging');
        
        // Calculate offset from the mouse position to the top-left corner of the element
        const rect = draggedElement.getBoundingClientRect();
        offset.x = e.clientX - rect.left;
        offset.y = e.clientY - rect.top;
        
        // Add event listeners for the drag operation
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        
        e.preventDefault();
    }
    
    function drag(e) {
        if (!draggedElement) return;
        
        // Update grid boundaries
        gridRect = grid.getBoundingClientRect();
        
        // Calculate new position
        let left = e.clientX - offset.x;
        let top = e.clientY - offset.y;
        
        // Get grid's computed style to account for padding correctly
        const computedStyle = window.getComputedStyle(grid);
        const paddingTop = parseInt(computedStyle.paddingTop);
        const paddingLeft = parseInt(computedStyle.paddingLeft);
        const paddingRight = parseInt(computedStyle.paddingRight);
        const paddingBottom = parseInt(computedStyle.paddingBottom);
        
        // Convert mouse position to position relative to the grid's content area
        const relativeX = left - gridRect.left;
        const relativeY = top - gridRect.top;
        
        // Keep element within grid boundaries
        const boundedX = Math.max(paddingLeft, Math.min(relativeX, gridRect.width - paddingRight - draggedElement.offsetWidth));
        const boundedY = Math.max(paddingTop, Math.min(relativeY, gridRect.height - paddingBottom - draggedElement.offsetHeight));
        
        // Snap to grid
        const cellX = (boundedX - paddingLeft) / cellSize.width;
        const cellY = (boundedY - paddingTop) / cellSize.height;
        
        const snappedX = Math.round(cellX) * cellSize.width + paddingLeft;
        const snappedY = Math.round(cellY) * cellSize.height + paddingTop;
        
        // Check if the new position would cause an overlap
        if (!wouldOverlap(draggedElement, snappedX, snappedY, draggedElement.offsetWidth, draggedElement.offsetHeight)) {
            // No overlap, so apply the new position
            draggedElement.style.left = `${snappedX}px`;
            draggedElement.style.top = `${snappedY}px`;
            draggedElement.classList.remove('invalid-position');
        } else {
            // Position would cause overlap, apply visual indicator
            draggedElement.classList.add('invalid-position');
        }
    }
    
    function stopDrag() {
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
            draggedElement = null;
        }
        
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
    }
    
    // Resize functionality
    function startResize(e) {
        e.stopPropagation();
        currentResizeElement = this.parentElement;
        
        // Add event listeners for the resize operation
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
        
        e.preventDefault();
    }
    
    function resize(e) {
        if (!currentResizeElement) return;
        
        // Calculate new size
        const rect = currentResizeElement.getBoundingClientRect();
        const width = Math.max(cellSize.width, e.clientX - rect.left);
        const height = Math.max(cellSize.height, e.clientY - rect.top);
        
        // Snap to grid
        const sizeW = Math.max(1, Math.round(width / cellSize.width));
        const sizeH = Math.max(1, Math.round(height / cellSize.height));
        const size = Math.max(sizeW, sizeH);
        
        const newWidth = size * cellSize.width;
        const newHeight = size * cellSize.height;
        
        // Get current position
        const left = parseInt(currentResizeElement.style.left);
        const top = parseInt(currentResizeElement.style.top);
        
        // Check if the new size would cause an overlap
        if (!wouldOverlap(currentResizeElement, left, top, newWidth, newHeight)) {
            // Update element size and attribute
            currentResizeElement.setAttribute('data-size', size);
            currentResizeElement.style.width = `${newWidth}px`;
            currentResizeElement.style.height = `${newHeight}px`;
            currentResizeElement.classList.remove('invalid-position');
        } else {
            currentResizeElement.classList.add('invalid-position');
        }
    }
    
    function stopResize() {
        currentResizeElement = null;
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        gridRect = grid.getBoundingClientRect();
        cellSize = { 
            width: gridRect.width / 12, 
            height: 50 
        };
        
        // Update all elements' sizes
        const elements = document.querySelectorAll('.grid-item');
        elements.forEach(element => {
            const size = parseInt(element.getAttribute('data-size'));
            element.style.width = `${size * cellSize.width}px`;
            element.style.height = `${size * cellSize.height}px`;
        });
    });
});
