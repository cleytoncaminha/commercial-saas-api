import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class AssignMembershipRolesDto {
  @ApiProperty({
    example: ['5a3a41f0-3b0b-4b6d-8d0f-277aaf4d9d7f'],
    description: 'Tenant-scoped role ids to assign to the membership.',
    type: [String],
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  roleIds!: string[];
}
