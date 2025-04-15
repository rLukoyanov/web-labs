import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    Default,
    ForeignKey,
    BelongsTo,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
  } from 'sequelize-typescript';
  import { User } from '@models/User';
  
  /**
   * @openapi
   * components:
   *   schemas:
   *     Event:
   *       type: object
   *       required:
   *         - title
   *         - date
   *         - createdBy
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
   *         createdBy:
   *           type: string
   *           format: uuid
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
  export class Event extends Model<Event> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id!: string;
  
    @Column(DataType.STRING)
    title!: string;
  
    @Column(DataType.TEXT)
    description?: string;
  
    @Column(DataType.DATE)
    date!: Date;
  
    @ForeignKey(() => User)
    @Column(DataType.UUID)
    createdBy!: string;
  
    @BelongsTo(() => User, 'createdBy')
    user!: User;
  
    @CreatedAt
    @Column({ field: 'created_at' })
    createdAt!: Date;
  
    @UpdatedAt
    @Column({ field: 'updated_at' })
    updatedAt!: Date;
  
    @DeletedAt
    @Column({ field: 'deleted_at' })
    deletedAt!: Date;
  }
  