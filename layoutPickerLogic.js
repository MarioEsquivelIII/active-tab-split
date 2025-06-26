// LayoutPicker logic extracted from the React component

const layouts = [
    { id: 1, label: '1 Panel' },
    { id: 2, label: '2 Panels' },
    { id: 3, label: '3 Panels' },
    { id: 4, label: '4 Panels' },
];

function getLayoutIcon(id) {
    switch (id) {
        case 1:
            return 'layout-1'; // Use this class for 1 panel
        case 2:
            return 'layout-2'; // Use this class for 2 panels
        case 3:
            return 'layout-3'; // Use this class for 3 panels
        case 4:
            return 'layout-4'; // Use this class for 4 panels
        default:
            return '';
    }
}

// Example usage in vanilla JS:
// let selected = 1;
// function selectLayout(id) {
//   selected = id;
//   // update UI accordingly
// }

export { layouts, getLayoutIcon }; 