// The Quorvia logo mark, in one place. The public pages, the lead tracker and the favicon all use this drawing.

function logoMarkSvg(className = 'logo-mark') {
  return (
    `<svg class="${className}" viewBox="44 23 152 152" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">` +
    '<circle cx="120" cy="99" r="68" fill="none" stroke="currentColor" stroke-width="9"/>' +
    '<rect x="95" y="130" width="14" height="30" rx="2" fill="currentColor"/>' +
    '<rect x="113" y="110" width="14" height="50" rx="2" fill="currentColor"/>' +
    '<rect x="131" y="85" width="14" height="75" rx="2" fill="currentColor"/>' +
    '<path d="M88,150 C115,180 150,150 170,100" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>' +
    '<polygon points="182,86 158,94 174,112" fill="currentColor"/>' +
    '</svg>'
  );
}

module.exports = { logoMarkSvg };
