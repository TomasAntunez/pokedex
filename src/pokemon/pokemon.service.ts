import {
  BadRequestException, Injectable, InternalServerErrorException, NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';


@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>
  ) {}


  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      return await this.pokemonModel.create( createPokemonDto );
    } catch (error) {
      this.handleExceptions( error );
    }
  }


  findAll( paginationDto: PaginationDto ) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.pokemonModel.find().limit(limit).skip(offset)
      .sort({ no: 1 })
      .select('-__v');
  }


  async findOne(searchTerm: string) {

    let pokemon: Pokemon;

    if ( !isNaN(+searchTerm) ) {
      pokemon = await this.pokemonModel.findOne({ no: searchTerm });
    }

    // MongoID
    if ( !pokemon && isValidObjectId(searchTerm) ) {
      pokemon = await this.pokemonModel.findById(searchTerm);
    }

    // Name
    if ( !pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name: searchTerm.trim().toLowerCase() })
    }

    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id, name or no "${searchTerm}" not found`);
    }

    return pokemon;
  }


  async update(searchTerm: string, updatePokemonDto: UpdatePokemonDto) {
    
    const pokemon = await this.findOne( searchTerm );

    if ( updatePokemonDto.name ) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }

    try {
      await pokemon.updateOne( updatePokemonDto );
      return { ...pokemon.toJSON(), ...updatePokemonDto };

    } catch (error) {
      this.handleExceptions( error );
    }
  }


  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();

    // const result = await this.pokemonModel.findByIdAndDelete(id);

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if ( deletedCount === 0 ) {
      throw new NotFoundException(`Pokemon with id "${ id }" not found`);
    }
  }


  private handleExceptions( error: any ) {
    if ( error.code === 11000 ) {
      throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify(error.keyValue) }`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create or update Pokemon - Check server logs`);
  }

}
