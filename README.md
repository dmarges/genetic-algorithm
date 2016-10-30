# Javascript Genetic Algorithm Library

This is a standalone Genetic Algorithm libary and is an alternative to something like Encog 
which is an entire suite of Machine Learning tools.

# What is a Genetic Algorithm?

In a nutshell, a Genetic Algorithm is a way of solving a given problem in a similar way to how living
things in nature evolve to overcome problems in their environment. You basically "encode" a problem in such
a way that the algorithm can reach an optimal solution to the problem. 

# Sample Usage
```
		//Include the JS files in your project.
		
		//Setup
		//Create a population of size 128 with each having a chromosome length of 64. The crossover rate is 0.7 and the mutation
		//rate is 0.001.
		var ga = new GeneticAlgorithm(128, 64, 0.7, 0.001, true); 


		//Running the algorithm

		this.geneticAlgorithm.testFunction = function(decodedChromosome) {

		var total = 0;

		for (var i = 0; i < decodedChromosome.length; i++) {
			total += decodedChromosome[i];
		}

		//This would be run in a loop
		ga.epoch();
			
			
```
