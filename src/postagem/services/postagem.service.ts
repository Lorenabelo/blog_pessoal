import { InjectRepository } from '@nestjs/typeorm';
import { Postagem } from '../entities/postagem.entity';
import { DeleteResult, ILike, Repository } from 'typeorm';
import { HttpException, Injectable, HttpStatus } from '@nestjs/common';

@Injectable()
export class PostagemService {
  constructor(
    @InjectRepository(Postagem)
    private postagemRepository: Repository<Postagem>,
  ) {}

  async findAll(): Promise<Postagem[]> {
    return await this.postagemRepository.find();
  }

  async findById(id: number): Promise<Postagem> {
    const postagem = await this.postagemRepository.findOne({
      where: {
        id,
      },
    });

    if (!postagem) {
      throw new HttpException('Postagem não encontrada', HttpStatus.NOT_FOUND);
    }

    return postagem;
  }

  async findByTitulo(titulo: string): Promise<Postagem[]> {
    return await this.postagemRepository.find({
      where: {
        titulo: ILike(`%${titulo}%`),
      },
    });
  }

  async create(postagem: Postagem): Promise<Postagem> {
    return await this.postagemRepository.save(postagem);
  }

  async update(postagem: Postagem): Promise<Postagem> {
    const buscaPostagem: Postagem = await this.findById(postagem.id);

    if (!buscaPostagem || !postagem.id) {
      throw new HttpException('Postagem não encontrada!', HttpStatus.NOT_FOUND);
    }

    return await this.postagemRepository.save(postagem);
  }

  async delete(id: number): Promise<DeleteResult> {
    const buscaPostagem = await this.findById(id);

    if (!buscaPostagem) {
      throw new HttpException('Postagem não encontrada!', HttpStatus.NOT_FOUND);
    }

    return await this.postagemRepository.delete(id);
  }
}
