let draggedElem = null;
let firstPositionCenter = null;
let chessmenOnCell = [];
let turn = 0;
let locked = false;

function getSize(x, y) {
    const elem = $('#cell-' + y + '-' + x).children().last();
    if (isNaN(elem.data('size'))) {
        return -1;
    }

    return elem.data('size') - 0;
}

function getPlayerNum(x, y) {
    const elem = $('#cell-' + y + '-' + x).children().last();
    if (isNaN(elem.data('player-num'))) {
        return -1;
    }

    return elem.data('player-num') - 0;
}
function getWinner() {
    function getRowWinner(points) {
        let tempWinner = getPlayerNum(points[0][0], points[0][1]);
        if (tempWinner < 0) {
            return -1;
        }
        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            if (tempWinner != getPlayerNum(points[i][0], points[i][1])) {
                return -1;
            }
        }
        return tempWinner;
    }

    let winner = -1;
    let tempWinner;
    for (let i = 0; i < 3; i++) {
        tempWinner = getRowWinner([[i, 0], [i, 1], [i, 2]]);
        if (tempWinner >= 0) {
            if (winner >= 0 && tempWinner != winner) {
                return 2;
            } else {
                winner = tempWinner;
            }
        }
        tempWinner = getRowWinner([[0, i], [1, i], [2, i]]);
        if (tempWinner >= 0) {
            if (winner >= 0 && tempWinner != winner) {
                return 2;
            } else {
                winner = tempWinner;
            }
        }
    }
    tempWinner = getRowWinner([[0, 0], [1, 1], [2, 2]]);
    if (tempWinner >= 0) {
        if (winner >= 0 && tempWinner != winner) {
            return 2;
        } else {
            winner = tempWinner;
        }
    }
    tempWinner = getRowWinner([[0, 2], [1, 1], [2, 0]]);
    if (tempWinner >= 0) {
        if (winner >= 0 && tempWinner != winner) {
            return 2;
        } else {
            winner = tempWinner;
        }
    }
    return winner;
}

function updatePosition() {
    for (const chessman of chessmenOnCell) {
        const target = $('#cell-' + chessman.y + '-' + chessman.x);
        const top = target.offset().top;
        const left = target.offset().left;

        chessman.elem.css({
            'top': top + 6 + 'px',
            'left': left + 6 + 'px'
        });
    }
}

function getCellAtPointer(cursorX, cursorY) {
    const cellWidth = 100;
    let x = -1;
    let y = -1;

    for (let i = 0; i < 3; i++) {
        const target = $('#cell-0-' + i);
        const left = target.offset().left;
        if (left <= cursorX - 4 && cursorX <= left + cellWidth + 4) {
            x = i;
            break;
        }
    }
    for (let i = 0; i < 3; i++) {
        const target = $('#cell-' + i + '-0');
        const top = target.offset().top;
        if (top <= cursorY - 4 && cursorY <= top + cellWidth + 4) {
            y = i;
            break;
        }
    }
    return { x, y };
}

function isAllocableChessman(x, y, size) {
    if (x < 0 || y < 0) {
        return false;
    }
    return getSize(x, y) < size;
}

function placeDraggedElem(x, y) {
    const interval = 0.2;
    draggedElem.css('transition', interval + 's');

    const target = $('#cell-' + y + '-' + x);
    const top = target.offset().top;
    const left = target.offset().left;

    draggedElem.css({
        'top': top + 6 + 'px',
        'left': left + 6 + 'px'
    });

    setTimeout(function () {
        draggedElem.removeClass('dragged');
        draggedElem.addClass('on-cell');
        draggedElem.css('transition', '0s');
        draggedElem.appendTo(target);
        chessmenOnCell.push({
            elem: draggedElem,
            x: x,
            y: y
        });
        draggedElem = null;
    }, interval * 1000);
}

function endDrag(x, y) {
    if (!isAllocableChessman(x, y, draggedElem.data('size') - 0)) {
        // 変なところに置いた場合

        const parent = draggedElem.parent();
        x = parent.data('x');
        y = parent.data('y');
        if (x !== undefined && y !== undefined) {
            draggedElem.removeClass('dragged');
            placeDraggedElem(x - 0, y - 0)
        } else {
            draggedElem.css('transition', '0.2s');
            draggedElem.css({
                'top': firstPositionCenter[1] - 45 + 'px',
                'left': firstPositionCenter[0] - 45 + 'px',
            });
            setTimeout(function () {
                draggedElem.css('transition', '0s');
                draggedElem.removeClass('dragged');
            }, 200);
        }
    } else {
        locked = true
        placeDraggedElem(x, y);
        setTimeout(function () {
            const winner = getWinner();
            if (winner >= 0) {
                if (winner == 0) {
                    $('#message-0').text('あなたの勝ちです');
                    $('#message-1').text('あなたの負けです');
                } else if (winner == 1) {
                    $('#message-0').text('あなたの負けです');
                    $('#message-1').text('あなたの勝ちです');
                } else {
                    $('#message-0').text('引き分けです');
                    $('#message-1').text('引き分けです');
                }
                $('#message-container').removeClass('d-none');
                $(window).on('mousedown touchstart', function () {
                    initGame();
                });
                return;
            }
            nextTurn();
        }, 500);
    }
    $(window).off('mousemove touchmove');
    $(window).on('touchmove', function (event) {
        event.preventDefault(); // プル・トゥ・リフレッシュ防止
    }, { passive: false });
}

function nextTurn(initialize = false) {
    if (initialize) {
        turn = 0;
    } else {
        turn++;
    }
    locked = false;
    if (turn % 2 == 0) {
        $('#chessman-container-0').addClass('active');
        $('#chessman-container-1').removeClass('active');
    } else {
        $('#chessman-container-0').removeClass('active');
        $('#chessman-container-1').addClass('active');
    }
}

function initGame() {
    $('#message-container').addClass('d-none');
    $('.cell').children().remove();
    $('#chessman-container-0').html(`
        <div class="chessman" data-size="2" data-player-num="0"><img src="./img/face2.png"></div>
        <div class="chessman" data-size="2" data-player-num="0"><img src="./img/face2.png"></div>
        <div class="chessman" data-size="1" data-player-num="0"><img src="./img/face1.png"></div>
        <div class="chessman" data-size="1" data-player-num="0"><img src="./img/face1.png"></div>
        <div class="chessman" data-size="0" data-player-num="0"><img src="./img/face0.png"></div>
        <div class="chessman" data-size="0" data-player-num="0"><img src="./img/face0.png"></div>
    `);
    $('#chessman-container-1').html(`
        <div class="chessman" data-size="2" data-player-num="1"><img src="./img/face2.png"></div>
        <div class="chessman" data-size="2" data-player-num="1"><img src="./img/face2.png"></div>
        <div class="chessman" data-size="1" data-player-num="1"><img src="./img/face1.png"></div>
        <div class="chessman" data-size="1" data-player-num="1"><img src="./img/face1.png"></div>
        <div class="chessman" data-size="0" data-player-num="1"><img src="./img/face0.png"></div>
        <div class="chessman" data-size="0" data-player-num="1"><img src="./img/face0.png"></div>
    `);
    draggedElem = null;
    firstPositionCenter = null;
    chessmenOnCell = [];
    nextTurn(true);

    $(window).off();
    // ドラッグ関連のイベント
    $('.chessman img').on('mousedown touchstart', function (event) {
        event.preventDefault(); // ブラウザ標準動作をキャンセル
    });
    // ドラッグ開始時のイベント
    $('.chessman').on('mousedown touchstart', function (event) {
        if ($(this).data('player-num') != turn % 2 || locked) {
            draggedElem = null;
            return;
        }
        draggedElem = $(this);
        firstPositionCenter = [
            draggedElem.offset().left + draggedElem.outerWidth() / 2,
            draggedElem.offset().top + draggedElem.outerHeight() / 2
        ];
        draggedElem.addClass('dragged');
        draggedElem.css('transirion', '0s');
        if (event.clientY === undefined) {
            draggedElem.css({
                'top': event.changedTouches[0].pageY - 45 + 'px',
                'left': event.changedTouches[0].pageX - 45 + 'px',
            });
        } else {
            draggedElem.css({
                'top': event.clientY - 45 + 'px',
                'left': event.clientX - 45 + 'px',
            });
        }

        // ドラッグ中のイベント
        $(window).on('mousemove', function (event) {
            draggedElem.css({
                'top': event.clientY - 45 + 'px',
                'left': event.clientX - 45 + 'px',
            });
        });
        $(window).on('touchmove', function (event) {
            draggedElem.css({
                'top': event.changedTouches[0].pageY - 45 + 'px',
                'left': event.changedTouches[0].pageX - 45 + 'px',
            });
            event.preventDefault(); // プル・トゥ・リフレッシュ防止
        }, { passive: false });
    });

    // ドラッグ終了時のイベント
    $(window).on('touchend', function (event) {
        if (draggedElem == null) {
            return;
        }
        let { x, y } = getCellAtPointer(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
        endDrag(x, y);
    });
    $(window).on('mouseup', function (event) {
        if (draggedElem == null) {
            return;
        }
        let { x, y } = getCellAtPointer(event.clientX, event.clientY);
        endDrag(x, y);
    });
    $(window).on("scroll resize", function () {
        updatePosition();
    });
    $(window).on("orientationchange", function () {
        setTimeout(updatePosition, 300);
    });
}

$(function () {
    initGame();
});