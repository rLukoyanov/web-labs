import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    Default,
    BeforeCreate,
    AllowNull,
    Unique,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    HasMany,
  } from 'sequelize-typescript';
  import bcrypt from 'bcryptjs';
  import { Event } from '@models/Event';
  
  /**
   * @openapi
   * components:
   *   schemas:
   *     User:
   *       type: object
   *       required:
   *         - name
   *         - email
   *         - password
   *       properties:
   *         id:
   *           type: string
   *           format: uuid
   *           example: "123e4567-e89b-12d3-a456-426614174000"
   *         name:
   *           type: string
   *           example: "Иван Иванов"
   *         email:
   *           type: string
   *           format: email
   *           example: "ivan@example.com"
   *         password:
   *           type: string
   *           example: "hashedpassword"
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
    tableName: 'Users',
    paranoid: true,
    timestamps: true,
  })
  export class User extends Model<User> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    id!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    name!: string;
  
    @AllowNull(false)
    @Unique
    @Column({
      type: DataType.STRING,
      validate: { isEmail: true },
    })
    email!: string;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    password!: string;
  
    @CreatedAt
    @Column({ field: 'created_at' })
    createdAt!: Date;
  
    @UpdatedAt
    @Column({ field: 'updated_at' })
    updatedAt!: Date;
  
    @DeletedAt
    @Column({ field: 'deleted_at' })
    deletedAt!: Date;
  
    @HasMany(() => Event)
    events!: Event[];
  
    @BeforeCreate
    static async hashPassword(instance: User): Promise<void> {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }
  