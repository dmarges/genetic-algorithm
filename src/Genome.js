/**
 * A Genome in this instance is a type of object that will be encoded in a certain way as to attempt to solve a particular problem.
 * @author Donnie Marges <donniemarges@gmail.com>
 * @version 0.0.1
 */


/**
 * @constructor
 * @param {boolean} isBinary - Is this going to use a binary string to represent solution.
 * @param {number} min - To be used as a the lowest number in a range used for getting a random number.
 * @param {number} max - To be used as a the highest number in a range used for getting a random number.
 * @author Donnie Marges <donniemarges@gmail.com>
 * @version 0.0.1
 */
function Genome(isBinary, min, max) {
	/** The chromosome just holds whatever you decide to use to encode a potential solution to a problem. */
	this.chromosome = '';

	/** The fitness score is how we keep track of how well this genome is suited to solving a particular problem. */
	this.fitness = 0;

	if(isBinary === undefined) {
		this.isBinary = true;
	} else {
		this.isBinary = isBinary;
	}

	if(typeof min !== undefined) {
		this.min = min;
	}

	if(typeof max !== undefined) {
		this.max = max;
	}
}

/**
 * Generalized methods for a genome
 * @author Donnie Marges <donniemarges@gmail.com>
 * @version 0.0.1
 */
Genome.prototype = {

	/**
	 * Creates a random starting chromosome.
	 * @param {int} numOfBits - The number of bits that makes up a chromosome
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */	
	createStartChromosome: function(numOfBits) {
		if(!numOfBits) {
			return;
		}

		var codeString = '';

		if(this.isBinary) {
			for(var i = 0; i < numOfBits; i++) {
				codeString += Math.round(Math.random());
			}
		} else {
			for(var i = 0; i < numOfBits; i++) {
				codeString += Math.floor(((Math.random() * this.max) + this.min));
			}		
		}

		this.chromosome = codeString;
	}
};