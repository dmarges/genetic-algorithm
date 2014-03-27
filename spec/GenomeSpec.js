describe("Creating a Genome", function() {
	beforeEach(function() {
		this.testGenome = new Genome();
	});

	it("should not be undefined", function() {
		expect(this.testGenome).not.toBe(undefined);
	});

	it("should have an empty chromosome property", function() {
		expect(this.testGenome.chromosome).toEqual('');
	});

	it("should have a fitness score of 0", function() {
		expect(this.testGenome.fitness).toEqual(0);
	});

	it("creating a starting chromosome should return undefined if not provided with number of bits to use", function() {
		expect(this.testGenome.createStartChromosome()).toBe(undefined);
	});

	it("should create a random chromosome from the number of bits provided", function() {
		this.testGenome.createStartChromosome(64);
		expect(this.testGenome.chromosome.length).toEqual(64);
	});

	afterEach(function() {
		this.testGenome = undefined;
	});
});