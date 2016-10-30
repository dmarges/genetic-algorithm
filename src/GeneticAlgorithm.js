/**
 * The Genetic Algorithm is what manages the Population of Genomes and directs their evolution towards solving a given problem.
 * @author Donnie Marges <donniemarges@gmail.com>
 * @version 0.0.1
 */


/**
 * @param {number} populationSize - The number of genomes that will make up the population size
 * @param {number} lengthOfChromosom - The number of 'bits' that will make up how you encode a possible solution
 * @param {number} crossoverRate - For use with crossover method of reproduction. This number is where to split the chromosome of the parent
 * @param {number} mutationRate - This is a number that represents the odds that a mutation of a chromosome will actually occur.
 * @param {boolean} isBinary - Will a binary string be used to encode potential solutions?
 * @constructor
 * @author Donnie Marges <donniemarges@gmail.com>
 * @version 0.0.1
 */
function GeneticAlgorithm(populationSize, lengthOfChromosome, crossoverRate, mutationRate, isBinary) {
	this.populationSize = populationSize || 0;
	this.lengthOfChromosome = lengthOfChromosome || 0;
	this.crossoverRate = crossoverRate || 0;
	this.mutationRate = mutationRate || 0;
	this.isBinary = isBinary || true;

	/** 
	 * The gene length is the number of encoded bits it takes to represent data for a problem. For example, if you are
	 * encoding directions in a maze, you would need 2 bits to represent a direction. So, 00 could be north, 01 could be south
	 * and so on.
	 */
	this.geneLength = 0;

	/** This is the index of the fittest genome in the population array. */
	this.fittestGenome = 0;

	/** The best fitness score of the entire population. */
	this.bestFitnessScore = 0;

	/** The total fitness score of the entire population. */
	this.totalFitnessScore = 0;

	/** This holds the best chromosome of a generation. */
	this.memory = [];

	/** This holds the entire population of genomes. */
	this.population = [];

	/** This holds the current generation. This is used for determining when to invoke Eugenics protocols. */
	this.generation = 0;

	/** 
	 * This is a user defined function that will actually test each genome and assign a fitness score based on how well the 
	 * chromosome solves the problem.
	 */
	this.testFunction = undefined;

	/** This works the same way as in humans. You specify which gene is dominant over all others. */
	this.dominant = '1';
}

/**
 * Generalized methods for a genetic algorithm
 * @author Donnie Marges <donniemarges@gmail.com>
 * @version 0.0.1
 */
GeneticAlgorithm.prototype = {

	/**
	 * The epoch function is the main loop function of the algorithm. It is not required and you can create your own and just
	 * use other methods as needed. While a solution as not been found, it manages the reproduction and culling process of the population.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	epoch: function() {

		var newBabies = 0,
			mother,
			father;

		while(this.bestFitnessScore < 1) {
			this.updateFitnessScore();

			/** We want to keep the population size the same. */
			while(newBabies < (this.populationSize - this.population.length)) {
				mother = this.rouletteWheelSelection();
				father = this.rouletteWheelSelection();
				var baby = new Genome();

				//baby = this.crossover(father, mother, baby);				
				baby = this.mate(father, mother, baby);

				if(baby) {
					baby = this.mutate(baby);
					this.population.push(baby);
				}

				newBabies += 1;
			}

			this.sterilize();
			this.apocalypse();
			this.generation++;
		}
	},

	/**
	 * Creates a starting population of genomes to get the algorithm started.
	 * @param {number} numOfBits - Number of bits used to encode a chromosome.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	createStartPopulation: function(numOfBits) {
		if(!numOfBits) {
			return;
		}

		for(var i = 0, len = this.populationSize; i < len; i++) {
			var genome = new Genome();
			genome.createStartChromosome(numOfBits);
			this.population.push(genome);
		}
	},

	/**
	 * This function will take two parent genomes, and encode a baby chromosome from the two parent
	 * chromosomes based on a specified crossover rate value. The crossover value determines where
	 * to split up the father chromosome and appends another half of a chromosome from the mother.
	 * @param {Genome} father - A genome in the population selected by fitness.
	 * @param {Genome} mother - A genome in the population selected by fitness.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	crossover: function(father, mother) {
		if(!father || !mother) {
			return;
		}

		/** The mother and father cannot be the same*/
		if(Math.random() > this.crossoverRate || father.chromosome === mother.chromosome) {
			return;
		}

		/** This needs to be an integer value to properly perform the crossover. */
		var crossoverPoint = Math.floor(((Math.random() * this.lengthOfChromosome) + 1)),

			/** The baby that the two parents will create together. */
			baby = new Genome();

		for(var i = 0, len = crossoverPoint; i < len; i++) {
			baby.chromosome += father.chromosome[i].toString();
		}

		for(var i = crossoverPoint, len = mother.chromosome.length; i < len; i++) {
			baby.chromosome += mother.chromosome[i].toString();
		}

		return baby;
	},

	/**
	 * This function uses the popular Partially-Mapped Crossover type of crossover method in Genetic Algorithms.
	 * How it works is that you first choose two crossover points randomly. Then you look at what genes those points contain and 
	 * map those positions on the two parent chromosomes. Last, you go through each parents genes and swap the gene whereever a gene
	 * is found that matches one of those in your map.
	 * IMPORTANT: This is for use when encoding integers as genes in a chromosome, won't work with Binary Strings.
	 * @param {Genome} father - A genome in the population selected by fitness.
	 * @param {Genome} mother - A genome in the population selected by fitness.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	pmxCrossover: function(father, mother) {
		if(!father || !mother) {
			return;
		}

		var baby = new Genome(false, 1, 8),
			randomStart = Math.floor(((Math.random() * baby.max) + baby.min)),
			randomEnd = Math.floor(((Math.random() * baby.max) + randomStart)),
			parent = Math.round(Math.random()),
			parentGenome,
			geneMap = [];
		
		/** We randomly pick whether to use the mother or the father as the basis for the child. */
		if(parent) {
			parentGenome = mother;
		} else {
			parentGenome = father;
		}

		baby.chromosome = parentGenome.chromosome;

		/** We need to map the genes to swap. */
		for(var i = randomStart; i < randomEnd; i++) {
			if(mother.chromosome[i] !== father.chromosome[i]) {
				var tempObj = {};
				tempObj.mother = mother.chromosome[i];
				tempObj.father = father.chromosome[i];
				geneMap.push(tempObj);
				console.log('genemap-mother: ' + tempObj.mother);
				console.log('genemap-father: ' + tempObj.father);
			} else {
				console.log('same');
			}
		}

		var old = baby.chromosome;
		console.log('father: ' + father.chromosome);
		console.log('mother: ' + mother.chromosome);
		console.log('before: ' + old);

		/** Now we need to swap out the child's genes for those in the gene map. */
		for(var i = 0, len = this.lengthOfChromosome; i < len; i++) {
			for(var j = 0, len = geneMap.length; j < len; j++) {
				if(parentGenome.chromosome[i] === geneMap[j].mother) {
					baby.chromosome += geneMap[j].father;
				} else if(parentGenome.chromosome[i] === geneMap[j].father) {
					baby.chromosome += geneMap[j].mother;
				} else {
					baby.chromosome += parentGenome.chromosome[i];
				}

			}
		}

		console.log('after: ' + baby.chromosome);

		return baby;
	},

	/**
	 * This function will take two parent genomes, and encode a baby chromosome from the two parent
	 * chromosomes based on whether either parent has a dominant gene.
	 * @param {Genome} father - A genome in the population selected by fitness.
	 * @param {Genome} mother - A genome in the population selected by fitness.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	mate: function(father, mother) {
		if(!father || !mother) {
			return;
		}

		var baby = new Genome();

		for(var i = 0, len = this.lengthOfChromosome; i < len; i++) {
			if(father.chromosome[i] === this.dominant) {
				baby.chromosome += father.chromosome[i];
			} else if(mother.chromosome[i] === this.dominant) {
				baby.chromosome += mother.chromosome[i];
			} else {
				baby.chromosome += mother.chromosome[i];
			}
		}

		return baby;
	},

	/**
	 * Mutates a given genomes chromosome based on mutation rate.
	 * chromosomes based on whether either parent has a dominant gene.
	 * @param {Genome} genome - A genome which needs to be mutated.
	 * @param {number} min - To be used as a the lowest number in a range used for getting a random number.
	 * @param {number} max - To be used as a the highest number in a range used for getting a random number.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	mutate: function(genome, min, max) {
		if(!genome) {
			return;
		}

		if(typeof min === undefined) {
			min = 0;
		}

		if(typeof max === undefined) {
			max = 1;
		}

		/** We need to know when a gene ends and begins so that we do not mess up the genetic structure. */
		var divider = this.lengthOfChromosome / this.lengthOfGene,

			/** We need to find a gene randomly*/
			geneToMutate = Math.floor((Math.random() * divider) + 1),

			/** We need to know where to start mutating the gene. */
			geneStartIndex = this.lengthOfGene + geneToMutate;

		/** Let's go through the chromosome starting at the gene we want to mutate and mutate the values in that gene only. */
		for(var i = geneStartIndex, len = this.lengthOfGene; i <= len; i++) {
			if(Math.random() < this.mutationRate) {
				genome.chromosome[i] = Math.floor((Math.random() * max) + min).toString();
			}
		}

		return genome;
	},

	/**
	 * This function mutates a Chromosome based on a technique called Exchange Mutation. How it works is that given two random numbers
	 * that correspond to genes in a genome, this function will swap those two genes.
	 * @param {Genome} genome - A genome which needs to be mutated.
	 * @param {number} randomGene1 - A random number to use for gene selection.
	 * @param {number} randomGene2 - Another random number to use for gene selection.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	exchangeMutate: function(genome, randomGene1, randomGene2) {

		if(!genome) {
			return undefined;
		}

		/** If no numbers are supplied as arguments, we will create them. */
		if(!randomGene1) {
			randomGene1 = Math.floor((Math.random() * this.geneLength));
		}

		if(!randomGene2) {
			randomGene2 = Math.floor((Math.random() * this.geneLength));
		}

		/** We split the chromosome into an array. This will help us with manipulating the order of the genes as strings in JS are immutable. */
		var oldChromosome = genome.chromosome.split(''),
			gene1 = oldChromosome[randomGene1],
			gene2 = oldChromosome[randomGene2];

		/** We simply go through the chromosome, find the random spots and swap them with the desired genes. */
		for(var i = 0; i < oldChromosome.length; i++) {
			if(i === randomGene1) {
				oldChromosome[i] = gene2;
			} else if(i === randomGene2) {
				oldChromosome[i] = gene1;
			}
		}

		/** We convert the array we were using to re-order the chromosome back into a string to be stored with the chromosome. */
		genome.chromosome = oldChromosome.join('');

		return genome;
	},

	/**
	 * This function mutates a Chromosome based on a technique called Scramble Mutation. How it works is that given two numbers
	 * that represent a range, this function will scramble (randomly shift around) the genes within the given range.
	 * @param {Genome} genome - A genome which needs to be mutated.
	 * @param {number} randomGene1 - A random number to use for gene selection.
	 * @param {number} randomGene2 - Another random number to use for gene selection.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	scrambleMutate: function(genome, randomGene1, randomGene2) {

		if(!genome) {
			return undefined;
		}

		/** If no numbers are supplied as arguments, we will create them. */
		if(!randomGene1) {
			randomGene1 = Math.floor((Math.random() * this.geneLength));
		}

		if(!randomGene2) {
			randomGene2 = Math.floor((Math.random() * this.geneLength));
		}

		/**
		 * We need to ensure that the range is valid. As in, the first number passed in can't be higher or equal to the second number. If either
		 * of these conditions are true, we need to correct the range.
		 */

		if(randomGene1 > randomGene2 || randomGene1 === randomGene2) {
			randomGene1 = Math.floor((Math.random() * randomGene2));
		}

		/** We split the chromosome into an array. This will help us with manipulating the order of the genes as strings in JS are immutable. */
		var oldChromosome = genome.chromosome.split(''),
			scrambledGenes = oldChromosome.slice(randomGene1, randomGene2),
			randomizer = Math.floor((Math.random() * scrambledGenes.length)),
			temp,
			count = 0;


		/** Here's where we scramble the genes within the given range. It's not 100% random, but good enough for our purposes. */
		scrambledGenes.reverse();
		scrambledGenes.push(scrambledGenes.unshift());
		temp = scrambledGenes.splice(randomizer, 1);
		scrambledGenes.push(temp[0]);

		/** We simply go through the chromosome starting at the beginning of our range, and insert the genes in scrambled order back into the array. */
		for(var i = randomGene1; i < scrambledGenes.length; i++) {
			oldChromosome[i] = scrambledGenes[count];
			count++;
		}

		/** We convert the array we were using to re-order the chromosome back into a string to be stored with the chromosome. */
		genome.chromosome = oldChromosome.join('');

		return genome;
	},

	/**
	 * Goes through the population and assigns each genome a fitness score based on how it performs in the
	 * test function.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	updateFitnessScore: function() {
		for(var i = 0, len = this.population.length; i < len; i++) {

			/** We need to decode the chromosome into values meaningful to solving the problem. */
			var decodedChromosome = this.decode(this.population[i], this.geneLength);

			/** This is where we assign the fitness score for this genome based on how well it scores in test function. */
			this.population[i].fitness = this.testChromosome(decodedChromosome, this.testFunction);

			/** Add to total fitness score. */
			this.totalFitnessScore += this.population[i].fitness;

			/** We check to see if this genome is the most fit of the population. */
			if(this.population[i].fitness > this.bestFitnessScore) {
				this.bestFitnessScore = this.population[i].fitness;
				
				/** We want to remember this genome's chromosome. */
				this.memory = this.population[i].chromosome;

				/** We store the index of the fittest genome. */
				this.fittestGenome = i;


				/** If the fitness score is 1, this means that we should have solved the problem. */
				if(this.population[i].fitness === 1) {
					this.bestFitnessScore = 1;
				}
			}
		}
	},

	/**
	 * Gives algorithm's memory a value.
	 * @param {String | Int | Array | Object} memoryValue - What you want to set the algorithm's memory to.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	initMemory: function(memoryValue) {
		if(!memoryValue) {
			return;
		}

		this.memory = memoryValue;
	},

	/**
	 * Helper method to clear algorithm's memory.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	clearMemory: function() {
		this.memory = undefined;
	},

	/**
	 * Will take a chromosome from a genome and convert it to an array of integer values that represent how to solve a problem.
	 * @param {Genome} genome - The genome whose chromosome you want to decode.
	 * @param {Genome} lengthOfGene - The length of the gene in each chromosome.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	decode: function(genome, lengthOfGene) {
		if(!genome || !lengthOfGene) {
			return;
		}

		var decodedGenome = [],
			loopCount = 0,
			tempGene = '',
			intTempGene = 0;


		for(var i = 0, len = genome.chromosome.length; i < len; i += lengthOfGene) {

			/** Get all bits in this time through loop. */
			while(loopCount < lengthOfGene) {
				tempGene += genome.chromosome[i + loopCount];
				loopCount++;
			}

			/** Convert string to int. */
			/** Check if we are using binary strings to encode potential solution. */

			if(this.isBinary) {
				intTempGene = parseInt(tempGene, 2);
			} else {
				intTempGene = parseInt(tempGene);
			}

			/** Add int to array. */
			decodedGenome.push(intTempGene);

			tempGene = '';
			intTempGene = 0;
			loopCount = 1;
		}

		return decodedGenome;
	},

	/**
	 * This is a user defined function that will test each genome's chromosome and assign a fitness score.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	testChromosome: function(decodedChromosome, testFunc) {
		if(!decodedChromosome || !testFunc) {
			return;
		}

		return testFunc(decodedChromosome);
	},

	/**
	 * Selects a genome based on a concept called Roulette Wheel Selection. The idea is that if you think of each genome's
	 * fitness score as a slice on a roulette wheel, the fitter genomes will have a larger slice of the wheel.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	rouletteWheelSelection: function() {
		var total = 0,
			slice = Math.random() * this.totalFitnessScore,
			selectedGenome = 0;

		for(var i = 0, len = this.population.length; i < len; i++) {
			total += this.population[i].fitness;

			if(total > slice) {
				selectedGenome = i;
				break;
			}
		}

		return this.population[selectedGenome];
	},


	/**
	 * Selects a genome based how many times a genome is likely to reproduce.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	fitnessPropSelection: function() {
		var total = 0,
			decision = Math.random(),
			averageFitnessScore = this.averageFitnessScore(),
			selectedGenome;

		for(var i = 0, len = this.population.length; i < len; i++) {
			total += this.population[i].fitness / averageFitnessScore;

			if(decision <= total) {
				return this.population[i];
			}
		}
	},

	/**
	 * Convenience method to get average fitness score of population.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	averageFitnessScore: function() {
		return this.totalFitnessScore / this.population.length;
	},
	
	/**
	 * A Eugenics function to help keep the population moving towards a solution as there is a possibility population could
	 * get stuck and never solve a given problem.
	 * @param {number} benchmark - the cutoff fitness score. Any genomes below this number are removed from population.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	sterilize: function(benchmark) {
		if(!benchmark) {
			benchmark = this.averageFitnessScore();
		}

		var unfit = [];
		for(var i = 0, len = this.population.length; i < len; i++) {
			if(this.population[i].fitness < benchmark && this.population[i].fitness > 0) {
				unfit.push(i);
			}
		}

		for(var i = 0, len = unfit.length; i < len; i++) {
			this.population.splice(unfit[i], 1);
		}

		if(this.population.length === 0) {
			this.createStartPopulation(this.lengthOfChromosome);
		}
	},

	/**
	 * A Eugenics function that destroys most of population except top 5% in terms of fitness score. This is 
	 * used in an extreme situation where population will be stuck indefinitely.
	 * @param {number} apocalypseGen - The generation in which to trigger mass extinction.
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	apocalypse: function(apocalypseGen) {
		if(!apocalypseGen) {
			apocalypseGen = 30000;
		}

		if(this.generation > apocalypseGen) {
			var elite = this.getElite();
			this.population = elite;
			this.generation = 1;
		}
	},

	/**
	 * A Eugenics helper function that gets the top 5% of the population in terms of fitness score. 
	 * @author Donnie Marges <donniemarges@gmail.com>
	 * @version 0.0.1
	 */
	getElite: function() {
		var averageFitnessScore = this.averageFitnessScore(),
			numberOfElite = Math.ceil(this.population.length * 0.05),
			scoreToBeat = 0,
			returnElitePopulation = [],
			elitePopulation = this.population;

			elitePopulation.sort(function(a, b) {
				return b.fitness - a.fitness;
			});

		for(var i = 0; i < numberOfElite; i++) {
			returnElitePopulation.push(elitePopulation[i]);
		}

		return returnElitePopulation;
	},

	replaceGene: function(chromosome, oldGeneIndex, newGene) {
		if(!chromosome || !oldGeneIndex || !newGene) {
			console.log('here');
			return;
		}

		console.log('chromosome: ' + chromosome);
		console.log('oldGeneIndex: ' + oldGeneIndex);
		console.log('newGene: ' + newGene);

		console.log('beg: ' + chromosome.substring(0, oldGeneIndex));
		console.log('end: ' + chromosome.substring(oldGeneIndex + 1, chromosome.length - oldGeneIndex));

		var returnValue = chromosome.substring(0, oldGeneIndex) + newGene + chromosome.substring(oldGeneIndex + 1, chromosome.length - oldGeneIndex);

		console.log('return value: ' + returnValue);

		return returnValue;
	}
};