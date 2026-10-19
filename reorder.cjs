const fs = require('fs');
let code = fs.readFileSync('components/BadgeView.tsx', 'utf8');

// The exact string blocks
const timelineStartStr = "      {/* SECTION 2: TIMELINE */}";
const timelineEndStr = "      )}";
const stampsStartStr = "      {/* SECTION 1: VISITED PARKS (STAMPS) */}";
const stampsEndStr = "      </div>";
const achievementsStartStr = "      {/* SECTION 3: ACHIEVEMENTS - STAMP STYLE */}";

let parts = code.split(stampsStartStr);
let part1 = parts[0];
let rest1 = stampsStartStr + parts[1];

let parts2 = rest1.split(timelineStartStr);
let stampsBlock = parts2[0];
let rest2 = timelineStartStr + parts2[1];

let parts3 = rest2.split(achievementsStartStr);
let timelineBlock = parts3[0];
let part3 = achievementsStartStr + parts3[1];

let newCode = part1 + timelineBlock.replace("SECTION 2:", "SECTION 1:") + stampsBlock.replace("SECTION 1:", "SECTION 2:") + part3;

newCode = newCode.replace(/mb-20/g, 'mb-12');

newCode = newCode.replace(/<div className="relative w-full overflow-x-auto pb-12 pt-20 cursor-grab active:cursor-grabbing snap-x snap-mandatory \[\&::\-webkit\-scrollbar\]:hidden \[\-ms\-overflow\-style:none\] \[scrollbar\-width:none\]">/g, '<DraggableScroll>');
newCode = newCode.replace(/<\/div>\n        <\/div>\n      \)}/g, '</DraggableScroll>\n        </div>\n      )}');

// Fix the closing div for DraggableScroll
newCode = newCode.replace(
`                    <div className="w-8 shrink-0" />
                </div>
            </div>
        </div>
      )}`,
`                    <div className="w-8 shrink-0" />
                </div>
            </DraggableScroll>
        </div>
      )}`
);


fs.writeFileSync('components/BadgeView.tsx', newCode);
