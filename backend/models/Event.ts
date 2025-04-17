import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';

/**
 * @openapi
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - date
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "a3fa8c0b-5f01-4c57-9e4d-82bdbf8f82fa"
 *         title:
 *           type: string
 *           example: "Название мероприятия"
 *         description:
 *           type: string
 *           example: "Описание мероприятия"
 *         date:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 */

@Table({
  tableName: 'Events',
  paranoid: true,
  timestamps: true,
})
export class Event extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare title: string;

  @Column(DataType.TEXT)
  declare description: string | null;

  @Column(DataType.DATE)
  declare date: Date;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @DeletedAt
  @Column({ type: DataType.DATE, field: 'deleted_at' })
  declare deletedAt: Date | null;
}
