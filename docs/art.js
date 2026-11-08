/* Original SVG artwork for 玄鳳小屋. No external image assets. */
(function () {
  'use strict';

  const palettes = {
    lutino: {
      body: '#fff3bd', belly: '#fff9df', wing: '#f6e7a7', feather: '#fff9da',
      tail: '#ecd891', head: '#ffe883', crest: '#f4d44c', cheek: '#ef9a65',
      contour: '#e4cf8d'
    },
    gray: {
      body: '#92958f', belly: '#a7aba4', wing: '#777f79', feather: '#f4f3e7',
      tail: '#737c76', head: '#f7df7d', crest: '#e7ca57', cheek: '#ee9661',
      contour: '#6c766f'
    },
    pearl: {
      body: '#a7a79a', belly: '#c0c0ad', wing: '#858c7d', feather: '#f8efc6',
      tail: '#8e967f', head: '#f5e49a', crest: '#e6cf70', cheek: '#ed9e6b',
      contour: '#858d7d'
    }
  };

  function bird(color = 'lutino', className = '') {
    const variant = color === 'grey' ? 'gray' : color;
    const p = palettes[variant] || palettes.lutino;
    const safeClass = String(className).replace(/[^a-zA-Z0-9_ -]/g, '');
    const pearls = variant === 'pearl' ? `
      <g fill="${p.feather}" opacity=".94">
        <path d="M154 191q8-9 16 0q-8 11-16 0M171 201q8-9 16 0q-8 11-16 0M150 209q8-9 16 0q-8 11-16 0M166 222q8-9 16 0q-8 11-16 0M182 222q6-7 12 0q-6 9-12 0M155 238q7-8 14 0q-7 10-14 0M172 248q6-7 12 0q-6 9-12 0"/>
      </g>` : '';
    return `<svg class="bird-art ${safeClass}" viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <ellipse cx="150" cy="312" rx="53" ry="8" fill="#796c4f" opacity=".10"/>
      <g class="bird-body">
        <path d="M168 243C190 262 218 297 233 337C234 341 230 343 226 340C201 318 178 287 156 267Z" fill="${p.tail}"/>
        <path d="M174 255C190 280 206 306 215 331C195 313 178 286 165 269" fill="${p.feather}" opacity=".78"/>
        <path d="M96 163C84 184 83 215 91 244C99 275 117 295 145 297C177 300 200 276 205 244C211 211 193 174 166 160C144 149 112 149 96 163Z" fill="${p.body}"/>
        <path d="M98 190C85 222 100 274 126 284C143 291 157 280 159 256C164 226 143 193 116 181Z" fill="${p.belly}"/>
        <path d="M97 179C104 190 115 195 128 195" fill="none" stroke="${p.contour}" stroke-width="2" stroke-linecap="round" opacity=".45"/>
        <g class="bird-wing">
          <path d="M160 172C189 179 201 205 201 231C201 250 190 273 171 280C155 269 144 246 140 225C136 204 140 182 160 172Z" fill="${p.wing}"/>
          <path d="M167 184C185 194 194 211 195 229C191 226 185 221 180 214C174 205 170 196 167 184Z" fill="${p.feather}"/>
          <path d="M153 221C160 239 168 252 182 262M146 226C151 246 160 261 172 271" fill="none" stroke="${p.contour}" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>
          ${pearls}
        </g>
      </g>
      <g class="bird-foot" fill="none" stroke="#a98467" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M129 289L126 308M126 305L116 310M126 305L133 312"/>
      </g>
      <g class="bird-foot" fill="none" stroke="#a98467" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M165 291L163 310M163 307L153 312M163 307L171 313"/>
      </g>
      <g class="bird-head">
        <path d="M116 81C107 65 108 39 118 18C117 40 125 55 134 65C130 43 137 29 148 20C139 42 145 57 146 76Z" fill="${p.crest}"/>
        <path d="M128 79C125 63 127 48 130 39C132 56 139 66 145 75Z" fill="${p.head}"/>
        <path d="M158 173C140 188 112 183 95 165C79 148 73 123 81 102C89 78 109 66 132 68C158 70 178 88 181 111C185 137 176 159 158 173Z" fill="${p.head}"/>
        <path d="M93 139C98 160 115 174 136 176C119 183 104 176 94 164C87 155 82 144 82 131Z" fill="${p.body}" opacity=".65"/>
        <path d="M82 121C72 122 66 131 68 138C72 139 79 138 86 135Z" fill="#968c7f"/>
        <path d="M69 137C73 145 79 148 83 139" fill="#b3a18b"/>
        <path d="M72 131L80 132" stroke="#70695d" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="106" cy="147" r="15.5" fill="${p.cheek}"/>
        <ellipse cx="104" cy="143" rx="9" ry="5" fill="#f6b487" opacity=".6"/>
        <g class="bird-eye">
          <ellipse cx="103" cy="115" rx="7.2" ry="8.4" fill="#443d35"/>
          <circle cx="100.5" cy="112.3" r="2.5" fill="#fffdf4"/>
          <circle cx="105.3" cy="117.7" r="1.1" fill="#fffdf4" opacity=".6"/>
        </g>
        <path d="M94 100Q100 96 106 98" stroke="#b3a45d" stroke-width="2" stroke-linecap="round" fill="none" opacity=".52"/>
        <path d="M155 125Q162 131 157 138" stroke="${p.crest}" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".5"/>
      </g>
    </svg>`;
  }

  const paths = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/><path d="M8 6V3H5v5"/>',
    book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Z"/><path d="M12 5v15M6 8h3M6 12h3M15 8h3M15 12h3"/>',
    food: '<path d="M3 11h18c0 6-3 10-9 10S3 17 3 11Z"/><path d="M8 8c-2-2 2-3 0-5M13 8c-2-2 2-3 0-5M18 8c-2-2 2-3 0-5"/>',
    shield: '<path d="m12 2 8 3v6c0 5-3 8-8 11-5-3-8-6-8-11V5Z"/><path d="m8 11 3 3 5-6"/>',
    heart: '<path d="M20.8 5.6a5.3 5.3 0 0 0-7.5 0L12 7l-1.3-1.4a5.3 5.3 0 0 0-7.5 7.5L12 22l8.8-8.9a5.3 5.3 0 0 0 0-7.5Z"/>',
    settings: '<path d="m10 3-1 3-3 1-3-1-1 4 2 2v3l-2 2 2 3 3-1 3 2 1 2 4-1 1-3 3-1 2-2-1-4 1-2-3-3-3 1-2-2Z" transform="translate(1 -1) scale(.95)"/><circle cx="12" cy="12" r="3"/>',
    water: '<path d="M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13Z"/><path d="M8 15c0 2 1 3 3 3"/>',
    clean: '<path d="m16 3-6 9M7 11l7 5-4 6-8-6Z"/><path d="m6 15-2 3M9 17l-2 3M18 12v5M15.5 14.5h5M6 3v4M4 5h4"/>',
    play: '<path d="M9 3h6v4a3 3 0 0 1 4 5h3v6h-5a3 3 0 1 1-5 3v-3H6v-5a3 3 0 1 1-3-5h6Z" transform="translate(0 0) scale(.95)"/>',
    music: '<path d="M9 17V5l11-2v12M9 8l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/>',
    camera: '<path d="M8 5l2-2h4l2 2h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><circle cx="12" cy="12" r="4"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>',
    leaf: '<path d="M20 3C8 1 2 7 4 14c2 7 15 7 16-11Z"/><path d="M3 22 15 10M8 17v-6M12 13h5"/>',
    check: '<path d="m5 12 4 4L20 5"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
    volume: '<path d="m11 3-6 5H2v8h3l6 5ZM15 8a6 6 0 0 1 0 8M18 4a11 11 0 0 1 0 16"/>',
    muted: '<path d="m11 3-6 5H2v8h3l6 5ZM16 9l6 6M22 9l-6 6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/>',
    vet: '<path d="M7 6V3h10v3M3 7h18v14H3ZM10 11h4v3h3v3h-3v3h-4v-3H7v-3h3Z"/>',
    feather: '<path d="M20 3C9-1 3 9 6 16c6 3 16-3 14-13Z"/><path d="M3 22 16 9M7 17h6M10 14h6M10 14V9"/>',
    window: '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M12 3v18M3 12h18M1 22h22"/>',
    fan: '<circle cx="12" cy="12" r="2"/><path d="M11 10C5 6 8 1 12 2c4 1 3 5 1 8M14 12c7-2 9 3 6 6-3 3-6 0-7-4M11 14c-1 7-7 7-8 3s3-6 7-5"/>',
    pets: '<path d="M6 18c0-3 3-7 6-7s6 4 6 7-4 2-6 2-6 1-6-2Z"/><ellipse cx="4" cy="9" rx="2" ry="3"/><ellipse cx="10" cy="5" rx="2" ry="3"/><ellipse cx="16" cy="6" rx="2" ry="3"/><ellipse cx="21" cy="11" rx="2" ry="3"/>',
    objects: '<path d="m10 3-8 17h20L14 3a2.2 2.2 0 0 0-4 0Z"/><path d="M12 9v5M12 17v.1"/>',
    moon: '<path d="M21 14A9 9 0 0 1 10 3a9 9 0 1 0 11 11Z"/>',
    sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM21 2v4M19 4h4M3 19v4M1 21h4"/>'
  };

  function icon(name) {
    return `<svg class="icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${paths[name] || paths.info}</svg>`;
  }

  globalThis.CottageArt = Object.freeze({ bird, icon });
})();
