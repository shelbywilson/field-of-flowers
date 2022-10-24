# ✿ field of flowers ✿
Welcome to a sortable garden!

<img width="1256" alt="flowers" src="https://user-images.githubusercontent.com/5523024/197472122-0b40ab03-3829-4c68-a0cf-cfe619685875.png">

## Flowers 

These flowers are randomly generated and drawn on page load. 

## Sorting 

Sorting is hierarchical based on selected attributes and sort direction. Attributes are compared in order until a difference between flowers is found. Use slider to rescale field.

## Layouts 

### 1. Linear
<img width="1673" alt="flowers sorted linearly" src="https://user-images.githubusercontent.com/5523024/197474034-f68fbd7a-65e8-4f9d-bea1-716f2ae50c1d.png">

Flowers are arranged in order from left to right, wrapping to next row as needed. This mode is useful when comparing stem size or number of leaves. 

### 2. Hilbert curve
<img width="1413" alt="flowers sorted along a Hilbert curve" src="https://user-images.githubusercontent.com/5523024/197622141-f500d0f4-e30c-440a-b6fa-356e9028553c.png">

Uses a Hilbert curve (https://en.wikipedia.org/wiki/Hilbert_curve) to map items from a 1-dimensional array to 2-dimensional space, so that similar items are close in proximity. Conversely, sorting linearly by row could cause visual breaks in groups as they wrap from one line to the next. This mode is useful when sorting by color or flower size, grouping visually similar flowers together. 

Optionally, toggle sort path:

<img width="1412" alt="flowers sorted along a Hilbert curve with visible path" src="https://user-images.githubusercontent.com/5523024/197622217-e5449c74-aec7-4e25-b6b0-fb18bb7f86cc.png">


## Running locally

`python3 -m http.server 5775`
