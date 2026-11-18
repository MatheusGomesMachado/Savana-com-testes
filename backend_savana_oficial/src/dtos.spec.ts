import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './auth/dto/login.dto';
import { CreateUserDto } from './users/dto/create-user.dto';
import { CreatePetDto } from './pets/dto/create-pet.dto';
import { CreateMenuDto } from './menu/dto/create-menu.dto';

async function erros<T extends object>(
  cls: new () => T,
  dados: Record<string, unknown>,
): Promise<string[]> {
  const instancia = plainToInstance(cls, dados);
  const resultado = await validate(instancia);
  return resultado.map((e) => e.property);
}

describe('LoginDto', () => {
  it('aceita email e senha válidos', async () => {
    expect(
      await erros(LoginDto, { email: 'func@savana.com', password: '123456' }),
    ).toEqual([]);
  });

  it('rejeita email com formato inválido', async () => {
    expect(
      await erros(LoginDto, { email: 'nao-e-email', password: '123456' }),
    ).toContain('email');
  });

  it('rejeita senha com menos de 6 caracteres', async () => {
    expect(
      await erros(LoginDto, { email: 'func@savana.com', password: '123' }),
    ).toContain('password');
  });
});

describe('CreateUserDto', () => {
  const valido = {
    name: 'Maria Silva',
    cpf: '12345678901',
    email: 'maria@savana.com',
    password: '123456',
  };

  it('aceita um funcionário válido', async () => {
    expect(await erros(CreateUserDto, valido)).toEqual([]);
  });

  it('rejeita nome com menos de 3 caracteres', async () => {
    expect(await erros(CreateUserDto, { ...valido, name: 'Ma' })).toContain('name');
  });

  it('rejeita CPF fora do intervalo de 11 a 14 caracteres', async () => {
    expect(await erros(CreateUserDto, { ...valido, cpf: '123' })).toContain('cpf');
  });
});

describe('CreatePetDto', () => {
  const valido = {
    name: 'Rex',
    species: 'Cachorro',
    age: 3,
    breed: 'Vira-lata',
    description: 'Muito dócil e brincalhão',
  };

  it('aceita um animal válido (imagem é opcional)', async () => {
    expect(await erros(CreatePetDto, valido)).toEqual([]);
  });

  it('rejeita idade negativa', async () => {
    expect(await erros(CreatePetDto, { ...valido, age: -1 })).toContain('age');
  });

  it('rejeita descrição com menos de 10 caracteres', async () => {
    expect(await erros(CreatePetDto, { ...valido, description: 'curta' })).toContain(
      'description',
    );
  });
});

describe('CreateMenuDto', () => {
  const valido = {
    name: 'Cappuccino',
    description: 'Café com leite vaporizado',
    price: 12.5,
    category: 'Bebidas',
  };

  it('aceita um produto válido', async () => {
    expect(await erros(CreateMenuDto, valido)).toEqual([]);
  });

  it('rejeita preço menor que 0.01', async () => {
    expect(await erros(CreateMenuDto, { ...valido, price: 0 })).toContain('price');
  });
});