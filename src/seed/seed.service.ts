import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';


@Injectable()
export class SeedService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter
  ) {}


  async executeSeed() {

    await this.pokemonModel.deleteMany();

    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=400');

    const pokemonToInsert: { name: string, no: number }[] = [];

    data.results.forEach( ({ name, url }) => {

      const urlSegments = url.split('/');
      const no: number = +urlSegments[ urlSegments.length - 2 ];

      // await this.pokemonModel.create({ name, no });
      pokemonToInsert.push({ name, no });
    });

    await this.pokemonModel.insertMany( pokemonToInsert );

    return 'Seed executed';
  }

}
