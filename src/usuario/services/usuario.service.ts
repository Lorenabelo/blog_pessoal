import { Usuario } from './../entities/usuario.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bycrypt } from '../../auth/bcrypt/bcrypt';
import { Repository } from 'typeorm';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private bcrypt: Bycrypt,
  ) {}

  async findByUsuario(usuario: string): Promise<Usuario | undefined> {
    return await this.usuarioRepository.findOne({
      where: {
        usuario: usuario,
      },
    });
  }

  async findAll(): Promise<Usuario[]> {
    return await this.usuarioRepository.find({
      relations: {
        postagem: true,
      },
    });
  }

  async findById(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: {
        id: id,
      },

      relations: {
        postagem: true,
      },
    });

    if (!usuario) {
      throw new HttpException('Usuario não encontrado!', HttpStatus.NOT_FOUND);
    }

    return usuario;
  }

  async create(usuario: Usuario): Promise<Usuario> {
    const buscaUsuario = await this.findByUsuario(usuario.usuario);

    if (!buscaUsuario) {
      usuario.senha = await this.bcrypt.criptografarSenha(usuario.senha);
      return await this.usuarioRepository.save(usuario);
    }

    throw new HttpException('Usuario já existe!', HttpStatus.BAD_REQUEST);
  }

  async update(usuario: Usuario): Promise<Usuario> {
    const updateUsuario: Usuario = await this.findById(usuario.id);
    const buscaUsuario = await this.findByUsuario(usuario.usuario);

    if (!updateUsuario) {
      throw new HttpException('Usuario não encontrado!', HttpStatus.NOT_FOUND);
    }

    if (buscaUsuario && buscaUsuario.id !== usuario.id) {
      throw new HttpException(
        'Usuário (e-mail) já cadastrado!',
        HttpStatus.BAD_REQUEST,
      );
    }

    usuario.senha = await this.bcrypt.criptografarSenha(usuario.senha);

    return await this.usuarioRepository.save(usuario);
  }
}
