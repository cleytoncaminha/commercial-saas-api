import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { DEFAULT_PERMISSIONS, PermissionCode } from './permissions.constants';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionsRepository: Repository<PermissionEntity>,
  ) {}

  findAll(): Promise<PermissionEntity[]> {
    return this.permissionsRepository.find({
      order: {
        module: 'ASC',
        code: 'ASC',
      },
    });
  }

  findByCodes(codes: PermissionCode[]): Promise<PermissionEntity[]> {
    if (codes.length === 0) {
      return Promise.resolve([]);
    }

    return this.permissionsRepository.find({
      where: {
        code: In(codes),
      },
      order: {
        code: 'ASC',
      },
    });
  }

  async seedDefaultPermissions(): Promise<PermissionEntity[]> {
    await this.permissionsRepository.upsert(DEFAULT_PERMISSIONS, {
      conflictPaths: ['code'],
      skipUpdateIfNoValuesChanged: true,
    });

    return this.findAll();
  }
}
