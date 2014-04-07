/**
	Genetic Algorithm Unit Tests
	@version 0.0.1
	@author Don Marges <dmarges@postmedia.com>
 */

describe("Creating the Genetic Algorithm", function() {
	beforeEach(function() {
		this.geneticAlgorithm = new GeneticAlgorithm();
	});

	it("should not be undefined when creating a Genetic Algorithm object", function() {
		expect(this.geneticAlgorithm).not.toBe(undefined);
	});

	it("should set params when passed into constructor", function() {
		var ga = new GeneticAlgorithm(128, 64, 0.7, 0.001, true);

		expect(ga.populationSize).toEqual(128);
		expect(ga.lengthOfChromosome).toEqual(64);
		expect(ga.crossoverRate).toEqual(0.7);
		expect(ga.mutationRate).toEqual(0.001);
		expect(ga.isBinary).toBe(true);
	});

	afterEach(function() {
		this.geneticAlgorithm = undefined;
	});
});

describe("Running the Genetic Algorithm", function() {
	beforeEach(function() {
		this.geneticAlgorithm = new GeneticAlgorithm(64, 8, 0.7, 0.001);
		this.geneticAlgorithm.geneLength = 8;
		this.geneticAlgorithm.createStartPopulation(8);
		this.geneticAlgorithm.testFunction = function(decodedChromosome) {

			var total = 0;

			for (var i = 0; i < decodedChromosome.length; i++) {
				total += decodedChromosome[i];
			};
			
			return total / 255;
		};
	});

	it("should update the fitness score of each member of the population", function() {
		spyOn(this.geneticAlgorithm, 'updateFitnessScore').and.callThrough();
		this.geneticAlgorithm.epoch();
		expect(this.geneticAlgorithm.updateFitnessScore).toHaveBeenCalled();
		expect(this.geneticAlgorithm.totalFitnessScore).toBeGreaterThan(0);
	});

	it("should create offspring at least once in a generation", function() {
		spyOn(this.geneticAlgorithm, 'rouletteWheelSelection').and.callThrough();
		this.geneticAlgorithm.epoch();
		
		if(this.geneticAlgorithm.bestFitnessScore < 1) {
			expect(this.geneticAlgorithm.rouletteWheelSelection.calls.count()).toBeGreaterThan(1);
		}
	});

	it("should call the sterilize method to elimate poor performing members of generation", function() {
		spyOn(this.geneticAlgorithm, 'sterilize').and.callThrough();
		this.geneticAlgorithm.epoch();
		expect(this.geneticAlgorithm.sterilize).toHaveBeenCalled();
		expect(this.geneticAlgorithm.population.length).toBeLessThan(this.geneticAlgorithm.populationSize);
	});

	it("should increment the generation count when executed", function() {
		this.geneticAlgorithm.epoch();
		expect(this.geneticAlgorithm.generation).toBeGreaterThan(0);
	});

	afterEach(function() {
		this.geneticAlgorithm = undefined;
	});
});

describe("Creating a Start Population for the Genetic Algorithm", function() {
	beforeEach(function() {
		this.geneticAlgorithm = new GeneticAlgorithm(128, 64, 0.7, 0.001);
	});

	it("should create a start population with the size specified when object is created", function() {
		this.geneticAlgorithm.createStartPopulation(64);

		expect(this.geneticAlgorithm.population.length).toEqual(this.geneticAlgorithm.populationSize);
	});

	afterEach(function() {
		this.geneticAlgorithm = undefined;
	});
});

describe("Crossing over two parent Genomes", function() {
	beforeEach(function() {
		this.geneticAlgorithm = new GeneticAlgorithm(128, 64, 0.7, 0.001);

		this.father = new Genome();
		this.father.createStartChromosome(64);

		this.mother = new Genome();
		this.mother.createStartChromosome(64);
	});

	it("should return undefined if no args are provided", function() {
		expect(this.geneticAlgorithm.crossover()).toBe(undefined);
	});

	it("should return undefined if the father and mother chromosomes are the same", function() {
		this.mother.chromosome = this.father.chromosome;
		expect(this.geneticAlgorithm.crossover(this.father, this.mother)).toBe(undefined);
	});

	it("should create babies with a chromosome length greater than 0", function() {
		var baby1 = this.geneticAlgorithm.crossover(this.father, this.mother),
			baby2 = this.geneticAlgorithm.crossover(this.father, this.mother);

		if(baby1) {
			expect(baby1.chromosome.length).toBeGreaterThan(0);	
		}
		
		if(baby2) {
			expect(baby2.chromosome.length).toBeGreaterThan(0);	
		}
	});

	it("should return undefined if no params are passed into mate", function() {
		expect(this.geneticAlgorithm.mate()).toBe(undefined);
	});

	it("should return a baby from mate", function() {
		var baby1 = this.geneticAlgorithm.mate(this.father, this.mother);
		expect(baby1.chromosome.length).toEqual(64);
	});

	afterEach(function() {
		this.geneticAlgorithm = undefined;
		this.father = undefined;
		this.mother = undefined;
	});
});

/*describe("Crossing over two parent Genomes using Partially-Mapped Crossover technique", function() {

	beforeEach(function() {
		this.geneticAlgorithm = new GeneticAlgorithm(128, 8, 0.7, 0.001, false);

		this.father = new Genome(false, 1, 8);
		this.father.createStartChromosome(8);

		this.mother = new Genome(false, 1, 8);
		this.mother.createStartChromosome(8);
	});
	
	it("should return undefined if no valid arguments are passed into the function", function() {
		expect(this.geneticAlgorithm.pmxCrossover()).toBe(undefined);
	});

	it("should create an offspring using Partially-Mapped Crossover function", function() {
		var baby = this.geneticAlgorithm.pmxCrossover(this.father, this.mother);
		expect(baby.chromosome.length).toEqual(8)
	});

	afterEach(function() {
		this.geneticAlgorithm = undefined;
		this.father = undefined;
		this.mother = undefined;
	});
});*/

describe("Mutating offspring via Different Mutation operators", function() {
	beforeEach(function() {
		this.geneticAlgorithm = new GeneticAlgorithm(128, 8, 0.7, 0.001, false);
		this.offspring = new Genome(false, 1, 8);
		this.offspring.chromosome = '12345678';
	});

	it("shoud use exchange mutation operator to swap the values of two random genes", function() {

		var randomGene1 = Math.floor((Math.random() * 8)),
			randomGene2 = Math.floor((Math.random() * 8)),
			gene1 = this.offspring.chromosome[randomGene1],
			gene2 = this.offspring.chromosome[randomGene2];
	
		this.offspring = this.geneticAlgorithm.exchangeMutate(this.offspring, randomGene1, randomGene2);
		expect(this.offspring).not.toBe(undefined);
		expect(this.offspring.chromosome[randomGene1]).toEqual(gene2);
		expect(this.offspring.chromosome[randomGene2]).toEqual(gene1);
	});

	it("should use scramble mutation to scramble the genes between two random points", function() {
		var randomGene1 = Math.floor((Math.random() * 8)),
			randomGene2 = Math.floor((Math.random() * 8)),
			oldChromosome = this.offspring.chromosome;

		this.offspring = this.geneticAlgorithm.scrambleMutate(this.offspring, randomGene1, randomGene2);
		expect(this.offspring).not.toBe(undefined);
		expect(this.offspring.chromosome).not.toEqual(oldChromosome);
	});

	afterEach(function() {
		this.geneticAlgorithm = undefined;
		this.offspring = undefined;
	});
});

describe("Mutating offspring", function() {
	beforeEach(function() {
		this.geneticAlgorithm = new GeneticAlgorithm(128, 64, 0.7, 0.001);

		this.offspring = new Genome();
		this.offspring.createStartChromosome(64);
	});

	it("should return undefined if no genome is passed into the mutate function", function() {
		expect(this.geneticAlgorithm.mutate()).toBe(undefined);
	});

	afterEach(function() {
		this.geneticAlgorithm = undefined;
		this.offspring = undefined;
	});
});

describe("Updating the fitness score", function() {
	beforeEach(function() {
		this.geneticAlgorithm = new GeneticAlgorithm(64, 8, 0.7, 0.001);
		this.geneticAlgorithm.geneLength = 8;
		this.geneticAlgorithm.createStartPopulation(8);
		this.geneticAlgorithm.testFunction = function(decodedChromosome) {

			var total = 0;

			for (var i = 0; i < decodedChromosome.length; i++) {
				total += decodedChromosome[i];
			};
			
			return total / 255;
		};
	});

	it("should update the fitness score for each genome", function() {
		this.geneticAlgorithm.updateFitnessScore();
		expect(this.geneticAlgorithm.bestFitnessScore).toBeGreaterThan(0);
		expect(this.geneticAlgorithm.totalFitnessScore).toBeGreaterThan(0);
		expect(this.geneticAlgorithm.fittestGenome).toBeGreaterThan(0);
	});

	afterEach(function() {
		this.geneticAlgorithm = undefined;
	});
});

describe("Genetic Algorithm Memory", function() {
	beforeEach(function() {
		this.geneticAlgorithm = new GeneticAlgorithm(128, 64, 0.7, 0.001);
	});

	it("should return undefined if no initial memory is provided", function() {
		expect(this.geneticAlgorithm.initMemory()).toBe(undefined);
	});

	it("should initialize the Algorithm's memory", function() {
		this.geneticAlgorithm.initMemory([1, 2, 3]);

		expect(this.geneticAlgorithm.memory).not.toBe(undefined);
		expect(this.geneticAlgorithm.memory.length).toEqual(3);
	});

	it("should clear Algorithm's memory", function() {
		this.geneticAlgorithm.clearMemory();

		expect(this.geneticAlgorithm.memory).toBe(undefined);
	});

	afterEach(function() {
		this.geneticAlgorithm = undefined;
	});
});

describe("Decoding a potential solution", function() {
	beforeEach(function() {
		this.geneticAlgorithm = new GeneticAlgorithm(128, 64, 0.7, 0.001);
	});

	it("should return undefined when passed improper parameters", function() {
		expect(this.geneticAlgorithm.decode()).toBe(undefined);
	});

	it("should return an array of numbers based on chromosome passed in", function() {
		var testGenome = new Genome(),
			testDecodedChromosome;
		testGenome.createStartChromosome(16);

		testDecodedChromosome = this.geneticAlgorithm.decode(testGenome, 4);
		expect(testDecodedChromosome.length).toEqual(4);
	});

	it("should return an array of the right int numbers representing a solution based on chromosome passed in", function() {
		var testGenome = new Genome(),
			testDecodedChromosome;
		testGenome.chromosome = '0010';

		testDecodedChromosome = this.geneticAlgorithm.decode(testGenome, 4);
		expect(testDecodedChromosome[0]).toEqual(2);
	});

	afterEach(function() {
		this.geneticAlgorithm = undefined;
	});
});

describe("Testing a chromosome for fitness", function() {
	beforeEach(function() {
		this.geneticAlgorithm = new GeneticAlgorithm(128, 64, 0.7, 0.001);
	});

	it("should return undefined if no function to test chromosome is passed in", function() {
		expect(this.geneticAlgorithm.testChromosome()).toBe(undefined);
	});

	afterEach(function() {
		this.geneticAlgorithm = undefined;
	});
});

describe("Selecting fit members of population", function() {
	beforeEach(function() {
		this.geneticAlgorithm = new GeneticAlgorithm(64, 8, 0.7, 0.001);
		this.geneticAlgorithm.geneLength = 8;
		this.geneticAlgorithm.createStartPopulation(8);
		this.geneticAlgorithm.testFunction = function(decodedChromosome) {

			var total = 0;

			for (var i = 0; i < decodedChromosome.length; i++) {
				total += decodedChromosome[i];
			};
			
			return total / 255;
		};
	});

	it("should return a genome from fitness score of each member of population", function() {
		var selectedGenome = this.geneticAlgorithm.rouletteWheelSelection();
		expect(selectedGenome).not.toBe(undefined);
	});

	afterEach(function() {
		this.geneticAlgorithm = undefined;
	});
});

describe("Implementing Eugenics into population", function() {
	beforeEach(function() {
		this.geneticAlgorithm = new GeneticAlgorithm(64, 8, 0.7, 0.001);
		this.geneticAlgorithm.geneLength = 8;
		this.geneticAlgorithm.createStartPopulation(8);
		this.geneticAlgorithm.testFunction = function(decodedChromosome) {

			var total = 0;

			for (var i = 0; i < decodedChromosome.length; i++) {
				total += decodedChromosome[i];
			};
			
			return total / 255;
		};
	});

	it("should find average fitness score of population", function() {
		this.geneticAlgorithm.updateFitnessScore();
		expect(this.geneticAlgorithm.averageFitnessScore()).toBeGreaterThan(0);
	});

	it("should remove members of population below a certain score", function() {
		var oldAvg = this.geneticAlgorithm.averageFitnessScore();
		var oldPop = this.geneticAlgorithm.population.length;

		this.geneticAlgorithm.updateFitnessScore();
		this.geneticAlgorithm.sterilize(oldAvg);
		expect(this.geneticAlgorithm.averageFitnessScore()).not.toEqual(oldAvg);
		expect(this.geneticAlgorithm.population.length).toBeLessThan(oldPop);
	});

	it("should wipe out all but the top 5% of the population if a solution hasn't been reached by a certain generation", function() {
		var oldPop = this.geneticAlgorithm.population.length;
		this.geneticAlgorithm.updateFitnessScore();
		this.geneticAlgorithm.generation = 32000;
		this.geneticAlgorithm.apocalypse();
		expect(this.geneticAlgorithm.population.length).toBeLessThan(oldPop);
	});

	it("should get elite members of population", function() {
		this.geneticAlgorithm.updateFitnessScore();
		var elite = this.geneticAlgorithm.getElite();
		expect(elite.length).toEqual(4);
	});

	afterEach(function() {
		this.geneticAlgorithm = undefined;
	});
});
