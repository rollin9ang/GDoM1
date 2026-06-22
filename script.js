// 실행 중인 애니메이션 인터벌과 개별 타이머 배열을 관리하는 객체
const activeLoops = {};
const activeTimeouts = {}; 
const modeSounds = {
    open: new Audio('./sound/dooropen.mp3'),
    close: new Audio('./sound/doorclose.mp3')
};

Object.values(modeSounds).forEach(sound => {
    sound.preload = 'auto';
});

function playModeSound(soundName) {
    const sound = modeSounds[soundName];
    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch(() => {});
}

function runColorScan(targetId, listItems) {
    const itemsArray = Array.from(listItems);
    if (itemsArray.length === 0) return;

    const intervalTime = 140; 
    const holdTime = 130;     

    // 해당 카테고리에 쌓여있던 이전 setTimeout 잔상 초기화
    if (!activeTimeouts[targetId]) {
        activeTimeouts[targetId] = [];
    }
    activeTimeouts[targetId].forEach(t => clearTimeout(t));
    activeTimeouts[targetId] = [];

    const addTimeout = (fn, delay) => {
        const t = setTimeout(fn, delay);
        activeTimeouts[targetId].push(t);
    };

    // 1단계: 위에서 아래로 내려가는 스캔
    itemsArray.forEach((li, index) => {
        addTimeout(() => {
            // 상단 카테고리 자체도 열려있어야 하고, 동시에 다크 모드(item-title active)도 켜져 있어야 스캔 진행
            const isDark = document.getElementById('item-title') && document.getElementById('item-title').classList.contains('active');
            if (!document.getElementById(targetId).classList.contains('active') || !isDark) return;
            
            li.style.color = '#ff0000'; 

            addTimeout(() => {
                li.style.color = '#dfedef'; // 다크 모드 전용이므로 복귀 색상은 무조건 흰색
            }, holdTime);

        }, index * intervalTime);
    });

    // 2단계: 아래에서 위로 올라오는 스캔
    const bounceDelay = (itemsArray.length - 1) * intervalTime; 
    const reversedArray = [...itemsArray].reverse();

    reversedArray.forEach((li, index) => {
        if (index === 0) return; 

        addTimeout(() => {
            const isDark = document.getElementById('item-title') && document.getElementById('item-title').classList.contains('active');
            if (!document.getElementById(targetId).classList.contains('active') || !isDark) return;
            
            li.style.color = '#ff0000';

            addTimeout(() => {
                li.style.color = '#dfedef';
            }, holdTime);

        }, bounceDelay + (index * intervalTime));
    });
}

// 모든 상단 카테고리의 핑퐁 루프를 강제로 정지시키는 헬퍼 함수
function clearAllScans() {
    Object.keys(activeLoops).forEach(id => {
        clearInterval(activeLoops[id]);
        delete activeLoops[id];
    });
    Object.keys(activeTimeouts).forEach(id => {
        activeTimeouts[id].forEach(t => clearTimeout(t));
        activeTimeouts[id] = [];
    });
}

function toggleCategory(elementId) {
    const target = document.getElementById(elementId);
    if (!target) return;

    if (elementId === 'item-author' && !document.body.classList.contains('dark-mode')) {
        return;
    }

    const isActive = target.classList.toggle('active');

    // ==========================================
    // 1. 하단 메뉴 그룹(item-) 처리 (다크모드 제어)
    // ==========================================
    if (elementId.startsWith('item-')) {
        const allGlobalTitles = document.querySelectorAll('.clickable-title, .label, .value');
        const allGlobalListItems = document.querySelectorAll('.info-list li');

        if (elementId === 'item-title') {
            if (isActive) {
                // [다크모드 ON]
                playModeSound('open');
                document.body.classList.add('dark-mode');
                document.body.style.backgroundColor = '#3a4044';
                document.body.style.color = '#dfedef';
                allGlobalTitles.forEach(title => title.style.color = '#dfedef');
                allGlobalListItems.forEach(li => li.style.color = '#dfedef');

                // 💡 배경이 어두워졌으므로, 이미 상단에 열려있는(.active) 카테고리가 있다면 즉시 핑퐁 가동!
                document.querySelectorAll('.top-container .column.active').forEach(col => {
                    const listItems = col.querySelectorAll('.info-list li');
                    const colId = col.id;

                    runColorScan(colId, listItems);

                    const intervalTime = 140;
                    const holdTime = 130;
                    const loopInterval = ((listItems.length - 1) * intervalTime * 2) + holdTime + 200;

                    activeLoops[colId] = setInterval(() => {
                        runColorScan(colId, listItems);
                    }, loopInterval);
                });

            } else {
                // [다크모드 OFF]
                playModeSound('close');
                document.body.classList.remove('dark-mode');
                document.getElementById('item-author')?.classList.remove('active');
                document.body.style.backgroundColor = '#dfedef';
                document.body.style.color = '#3a4044';
                allGlobalTitles.forEach(title => title.style.color = '#3a4044');
                allGlobalListItems.forEach(li => li.style.color = '#3a4044');

                // 💡 배경이 밝아졌으므로 모든 핑퐁을 즉시 강제 종료하고 글자색을 검은색으로 리셋!
                clearAllScans();
                allGlobalListItems.forEach(li => li.style.color = '#3a4044');
            }
        }
        return; 
    }

    // ==========================================
    // 2. 상단 카테고리(col-) 전용 로직 처리
    // ==========================================
    if (elementId.startsWith('col-')) {
        const listItems = target.querySelectorAll('.info-list li');
        const isDark = document.getElementById('item-title') && document.getElementById('item-title').classList.contains('active');

        if (isActive) {
            // 카테고리 열기
            listItems.forEach(li => {
                li.classList.add('show');
                li.style.color = isDark ? '#dfedef' : '#3a4044';
            });

            // 💡 ★조건 검사★ 오직 다크 모드(isDark)가 켜져 있을 때만 핑퐁 루프를 생성합니다.
            if (isDark) {
                if (activeLoops[elementId]) clearInterval(activeLoops[elementId]);

                runColorScan(elementId, listItems);

                const intervalTime = 140;
                const holdTime = 130;
                const totalOnewayTime = (listItems.length - 1) * intervalTime;
                const loopInterval = (totalOnewayTime * 2) + holdTime + 200; 

                activeLoops[elementId] = setInterval(() => {
                    runColorScan(elementId, listItems);
                }, loopInterval);
            }

        } else {
            // 카테고리 닫기
            listItems.forEach(li => li.classList.remove('show'));

            // 이 열에 돌고 있던 인터벌 및 타이머 박멸
            if (activeLoops[elementId]) {
                clearInterval(activeLoops[elementId]);
                delete activeLoops[elementId];
            }
            if (activeTimeouts[elementId]) {
                activeTimeouts[elementId].forEach(t => clearTimeout(t));
                activeTimeouts[elementId] = [];
            }
        }
    }
}
