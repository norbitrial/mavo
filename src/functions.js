/**
 * Functions available inside Wysie expressions
 */

(function() {

var _ = Wysie.Functions = {
	/**
	 * Aggregate sum
	 */
	sum: function(array) {
		return numbers(array, arguments).reduce((prev, current) => {
			return +prev + (+current || 0);
		}, 0);
	},

	/**
	 * Average of an array of numbers
	 */
	average: function(array) {
		array = numbers(array, arguments);

		return array.length && _.sum(array) / array.length;
	},

	/**
	 * Min of an array of numbers
	 */
	min: function(array) {
		return Math.min(...numbers(array, arguments));
	},

	/**
	 * Max of an array of numbers
	 */
	max: function(array) {
		return Math.max(...numbers(array, arguments));
	},

	count: function(array) {
		return Array.isArray(array)? array.length : +(array === null);
	},

	/**
	 * Addition for elements and scalars.
	 * Addition between arrays happens element-wise.
	 * Addition between scalars returns their scalar sum (same as +)
	 * Addition between a scalar and an array will result in the scalar being added to every array element.
	 */
	add: function(...operands) {
		var ret = 0;

		operands.forEach(operand => {
			if (Array.isArray(operand)) {

				operand = numbers(operand);

				if (Array.isArray(ret)) {
					operand.forEach((n, i) => {
						ret[i] = (ret[i] || 0) + n;
					});
				}
				else {
					ret = operand.map(n => ret + n);
				}
			}
			else {
				// Operand is scalar
				if (isNaN(operand)) {
					// Skip this
					return;
				}

				operand = +operand;

				if (Array.isArray(ret)) {
					ret = ret.map(n => n + operand);
				}
				else {
					ret += operand;
				}
			}
		});

		return ret;
	},

	round: function(num, decimals) {
		if (!num || !decimals || !isFinite(num)) {
			return Math.round(num);
		}

		return +num.toLocaleString("en-US", {
			useGrouping: false,
			maximumFractionDigits: decimals
		});
	},

	iff: function(condition, iftrue, iffalse="") {
		return condition? iftrue : iffalse;
	}
};

_.avg = _.average;
_.iif = _.IF = _.iff;

// Make function names case insensitive
if (self.Proxy) {
	Wysie.Functions.Trap = new Proxy(_, {
		get: (functions, property) => {
			if (property in functions) {
				return functions[property];
			}

			var propertyL = property.toLowerCase && property.toLowerCase();

			if (propertyL && functions.hasOwnProperty(propertyL)) {
				return functions[propertyL];
			}

			if (property in Math || propertyL in Math) {
				return Math[property] || Math[propertyL];
			}

			if (property in self) {
				return self[property];
			}

			// Prevent undefined at all costs
			return property;
		},

		// Super ugly hack, but otherwise data is not
		// the local variable it should be, but the string "data"
		// so all property lookups fail.
		has: (functions, property) => property != "data"
	});
}

/**
 * Private helper methods
 */
function numbers(array, args) {
	array = Array.isArray(array)? array : (args? $$(args) : [array]);

	return array.filter(number => !isNaN(number)).map(n => +n);
}

})();