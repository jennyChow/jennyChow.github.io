$(document).ready(function() {

	var tetris_row_count = 19;
	var tetris_col_count = 10;
	var is_paused = false;

	/* Define the shape class used in Tetris game */
	var Shape = function () {
		this.row = -3;
		this.col = 3;
		this.color = "yellow";
	};

	// The function to decide if the cell is available
	Shape.prototype.cellAwailable = function (i, j) {
		var selector = "#centerContent .row:eq(" + i.toString() + ") div:eq(" + j.toString() + ")";
		if ($(selector).hasClass("yellow")) {
			return false;
		}
		return true;
	};

	Shape.prototype.removeColor = function() {
		for (var i=0; i<4; i++) {
			for (var j=0; j<4; j++) {
				if (this.position[i][j]) {
					var row_pos = this.row + i;
					var col_pos = this.col + j;
					if (row_pos >=0 && row_pos < tetris_row_count && col_pos >= 0 && col_pos < tetris_col_count) {
						var selector = "#centerContent .row:eq(" + row_pos.toString() + ") div:eq(" + col_pos.toString() + ")";
						$(selector).removeClass();
					}
				}
			}
		}
	}

	Shape.prototype.addColor = function() {
		for (var i=0; i<4; i++) {
			for (var j=0; j<4; j++) {
				if (this.position[i][j]) {
					var row_pos = this.row + i;
					var col_pos = this.col + j;
					if (row_pos >=0 && row_pos < tetris_row_count && col_pos >= 0 && col_pos < tetris_col_count) {
						var selector = "#centerContent .row:eq(" + row_pos.toString() + ") div:eq(" + col_pos.toString() + ")";
						$(selector).addClass(this.color);
					}
				}
			}
		}
	}

	Shape.prototype.findConflict = function() {
		var conflict = false;
		for (var i=0; i<4; i++) {
			for (var j=0; j<4; j++) {
				if (this.position[i][j]) {
					var row_pos = this.row + i;
					var col_pos = this.col + j;
					if (col_pos < 0 || col_pos >= tetris_col_count || row_pos >= tetris_row_count) {
						conflict = true;
						break;
					}
					if (row_pos < 0) {
						continue;
					}
					if (!this.cellAwailable(row_pos, col_pos)) {
						conflict = true;
						break;
					}
				}
			}
			if (conflict) {
				break;
			}
		}
		return conflict;
	}

	// Rotate clockwisely
	Shape.prototype.rotate = function() {
		this.removeColor();
		for (var i=0; i<=1; i++) {
			var tmp = this.position[i];
			this.position[i] = this.position[3-i];
			this.position[3-i] = tmp;
		}
		for (var i=0; i<=2; i++) {
			for (var j=i+1; j<=3; j++) {
				var tmp = this.position[i][j];
				this.position[i][j] = this.position[j][i];
				this.position[j][i] = tmp;
			}
		}

		var conflict = this.findConflict();
		if (conflict) {
			for (var i=0; i<4; i++) {
				for (var j=0; j<2; j++) {
					var tmp = this.position[i][j];
					this.position[i][j] = this.position[i][3-j];
					this.position[i][3-j] = tmp;
				}
			}
			for (var i=0; i<=2; i++) {
				for (var j=i+1; j<=3; j++) {
					var tmp = this.position[i][j];
					this.position[i][j] = this.position[j][i];
					this.position[j][i] = tmp;
				}
			}
		}
		this.addColor();
		return !conflict;
	};

	Shape.prototype.down = function() {
		this.removeColor();
		this.row ++;

		var conflict = this.findConflict();

		if (conflict) {
			this.row --;
		}
		this.addColor();
		return !conflict;
	};

	Shape.prototype.left = function() {
		this.removeColor();
		this.col --;

		var conflict = this.findConflict();

		if (conflict) {
			this.col ++;
		}
		this.addColor();
		return !conflict;
	};

	Shape.prototype.right = function() {
		this.removeColor();
		this.col ++;

		var conflict = this.findConflict();
		if (conflict) {
			this.col --;
		}
		this.addColor();
		return !conflict;
	}

	Shape.prototype.collapseLine = function() {
		var clear_times = 4;
		var clear_lines = 0;  //How many lines should we clear this time?
		while (clear_times > 0) {
			var line_number = -1;
			for (var i=0; i<4; i++) {
				var row_pos = this.row + i;
				var need_to_collapse = true;
				for (var j=0; j<tetris_col_count; j++) {
					var selector = "#centerContent .row:eq(" + row_pos.toString() + ") div:eq(" + j.toString() + ")";
					if (!$(selector).hasClass(this.color)) {
						need_to_collapse = false;
						break;
					}
				}
				if (!need_to_collapse) {
					continue;
				}
				line_number = row_pos;
				break;
			}
			if (line_number !== -1) {
				clear_lines ++;
				for (var i=line_number; i>0; i--) {
					for (var j=0; j<tetris_col_count; j++) {
						var parent_selector = "#centerContent .row:eq(" + (i-1).toString() + ") div:eq(" + j.toString() + ")";
						var selector = "#centerContent .row:eq(" + i.toString() + ") div:eq(" + j.toString() + ")";
						if ($(parent_selector).hasClass(this.color)) {
							$(selector).addClass(this.color);
						} else {
							$(selector).removeClass(this.color);
						}
					}
				}
			}
			clear_times --;
		}
	}

	/* Function used to generate shape1, which is
	 *   	* * *
	 *		*
	 */
	var createShape1 = function() {
		var shape = new Shape();
		shape.position = [
			[0, 0, 0, 0],
			[1, 1, 1, 0],
			[1, 0, 0, 0],
			[0, 0, 0, 0]
		];
		return shape;
	};

	/* Function used to generate shape3, which is
	 *   	* * *
	 *		    *
	 */
	var createShape2 = function() {
		var shape = new Shape();
		shape.position = [
			[0, 0, 0, 0],
			[1, 1, 1, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 0]
		];
		return shape;
	};

	/* Function used to generate shape3, which is
	 *   	  *
	 *		* * *
	 */
	var createShape3 = function() {
		var shape = new Shape();
		shape.position = [
			[0, 0, 0, 0],
			[0, 1, 0, 0],
			[1, 1, 1, 0],
			[0, 0, 0, 0]
		];
		return shape;
	};

	/* Function used to generate shape4, which is
	 *   	  *
	 *		* *
	 *      *
	 */
	var createShape4 = function() {
		var shape = new Shape();
		shape.position = [
			[0, 0, 0, 0],
			[0, 0, 1, 0],
			[0, 1, 1, 0],
			[0, 1, 0, 0]
		];
		return shape;
	};

	/* Function used to generate shape5, which is
	 *   	*
	 *		* *
	 *        *
	 */
	var createShape5 = function() {
		var shape = new Shape();
		shape.position = [
			[0, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 1, 1, 0],
			[0, 0, 1, 0]
		];
		return shape;
	};

	/* Function used to generate shape6, which is
	 *   	*
	 *		*
	 *      *
	 *      *
	 */
	var createShape6 = function() {
		var shape = new Shape();
		shape.position = [
			[0, 1, 0, 0],
			[0, 1, 0, 0],
			[0, 1, 0, 0],
			[0, 1, 0, 0]
		];
		return shape;
	};

	/* Function used to generate shape7, which is
	 *
	 *		* *
	 *      * *
	 */
	var createShape7 = function() {
		var shape = new Shape();
		shape.position = [
			[0, 0, 0, 0],
			[0, 1, 1, 0],
			[0, 1, 1, 0],
			[0, 0, 0, 0]
		];
		return shape;
	};

	var current_shape = null;
	var next_shape = null;

	var renderNextShapeWindow = function() {
		for (var i=0; i<4; i++) {
			for (var j=0; j<4; j++) {
				var selector = "#showWindow .row:eq(" + i.toString() + ") div:eq(" + j.toString() + ")";
				$(selector).removeClass();
			}
		}
		if (next_shape) {
			var position = next_shape.position;
			for (var i=0; i<4; i++) {
				for (var j=0; j<4; j++) {
					if (position[i][j]) {
						var selector = "#showWindow .row:eq(" + i.toString() + ") div:eq(" + j.toString() + ")";
						$(selector).addClass(next_shape.color);
					}
				}
			}
		}
	};

	var generateRandomShape = function() {
		var shapeGenerator = [createShape1, createShape2, createShape3, createShape3, createShape4, createShape5, createShape6, createShape7];
		current_shape = next_shape;
		if (!current_shape) {
			var currentGeneratorFunc = shapeGenerator[Math.floor(Math.random() * shapeGenerator.length)];
			current_shape = currentGeneratorFunc();
		}
		var nextGeneratorFunc = shapeGenerator[Math.floor(Math.random() * shapeGenerator.length)];
		next_shape = nextGeneratorFunc();

		renderNextShapeWindow();
	};

	// Bind keyup events
	var bindKeyEvents = function() {
		$(document).keydown(function(e) {
			if (current_shape) {
				if (e.keyCode === 38) {  //UP
					current_shape.rotate();
				} else if (e.keyCode === 40) { //DOWN
					current_shape.down();
				} else if (e.keyCode === 37) { //LEFT
					current_shape.left();
				} else if (e.keyCode === 39) {
					current_shape.right();
				}
			}
		});
	};
	bindKeyEvents();

	var shapeDrop = function() {
		if (is_paused) {
			return;
		}
		if (!current_shape.down()) {
			if (current_shape.row <= -2) {
				is_paused = true;
				$("#failMessage").dialog("open");
				return;
			}

			current_shape.collapseLine();
			generateRandomShape();
			shapeDrop();
		} else {
			setTimeout(shapeDrop, 500);
		}
	}

	var startGame = function () {
		generateRandomShape();
		shapeDrop();

	}
	startGame();

	$("#helpMessage").dialog({
		dialogClass: "no-title-bar",
		modal: true,
		buttons: {
			OK: function () {
				$(this).dialog("close");
				is_paused = false;
				shapeDrop();
			}
		},
		position: {
			my: "center",
			at: "center",
			of: "#centerContent"
		}
	});
	$("#helpMessage").dialog("close");

	var clearGame = function() {
		current_shape = null;
		next_shape = null;

		for (var i=0; i<4; i++) {
			for (var j=0; j<4; j++) {
				var selector = "#showWindow .row:eq(" + i.toString() + ") div:eq(" + j.toString() + ")";
				$(selector).removeClass();
			}
		}

		for (var i=0; i<tetris_row_count; i++) {
			for (var j=0; j<tetris_col_count; j++) {
				var selector = "#centerContent .row:eq(" + i.toString() + ") div:eq(" + j.toString() + ")";
				$(selector).removeClass();
			}
		}

	}

	$("#failMessage").dialog({
		dialogClass: "no-title-bar",
		modal: true,
		buttons: {
			OK: function () {
				$(this).dialog("close");
				clearGame();
			}
		},
		position: {
			my: "center",
			at: "center",
			of: "#centerContent"
		}
	});
	$("#failMessage").dialog("close");

	$("#helpBox").click(function() {
		$("#helpMessage").dialog("open");
		is_paused = true;
	});
	$("#pauseButton").click(function() {
		if (!is_paused) {
			is_paused = true;
			$("#pauseButton").text("Resume");
		} else {
			is_paused = false;
			$("#pauseButton").text("Pause");
			shapeDrop();
		}
	});

	$("#startButton").click(function() {
		clearGame();
		is_paused = false;
		startGame();
	});

	$("#endButton").click(function() {
		is_paused = true;
		clearGame();
	});
});
