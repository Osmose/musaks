;(function() {
    'use strict';

    var paper = Raphael(document.getElementById('canvas'), 800, 600);
    var nodes = [];
    var currentTool = 'move';
    var currentConnection = null;

    function linePath(startX, startY, endX, endY) {
        return 'M' + startX + ' '+ startY + ' L' + endX + ' ' + endY;
    }

    Raphael.fn.line = function(startX, startY, endX, endY) {
        var line = this.path(linePath(startX, startY, endX, endY));
        line.startX = startX;
        line.startY = startY;
        line.endX = endX;
        line.endY = endY;
        line.redraw = function() {
            this.attr('path', linePath(this.startX, this.startY, this.endX, this.endY));
        };

        return line;
    };

    function VisualNode(x, y, node) {
        this.circle = paper.circle(x, y, 10).attr('fill', '#F00');
        this.circle.isNode = true;
        this.circle.drag(function(dx, dy) {
            if (currentTool == 'move') {
                this.attr({cx: x + dx, cy: y + dy});
            } else if (currentTool == 'connect') {
                currentConnection.endX = x + dx;
                currentConnection.endY = y + dy;
                currentConnection.redraw();
            }
        }, function() {
            if (currentTool == 'move') {
                x = this.attr('cx');
                y = this.attr('cy');
            } else if (currentTool == 'connect') {
                currentConnection = paper.line(x, y, x, y);
            }
        }, function() {
            var elements = paper.getElementsByPoint(currentConnection.endX,
                                                    currentConnection.endY);
            if (elements) {
                var topNode = null;
                for (var k = 0; k < elements.length; k++) {
                    if (element.isNode) {
                        topNode = element;
                        break;
                    }
                }

                if (topNode) {

                }
            }
        });
    }

    paper.canvas.onclick = function(e) {
        e.preventDefault();
        if (currentTool == 'sourcenode') {
            nodes.append(new VisualNode(e.pageX, e.pageY, null));
        }
    };

    var $tools = $('#tools li');
    $tools.click(function(e) {
        var $newTool = $(this);
        currentTool = $newTool.data('tool');
        $tools.removeClass('selected');
        $newTool.addClass('selected');
    });
})();
