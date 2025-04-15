var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Table, Column, Model, DataType, PrimaryKey, Default, BeforeCreate, AllowNull, Unique, CreatedAt, UpdatedAt, DeletedAt, HasMany, } from 'sequelize-typescript';
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
let User = class User extends Model {
    static async hashPassword(instance) {
        const salt = await bcrypt.genSalt(10);
        instance.password = await bcrypt.hash(instance.password, salt);
    }
};
__decorate([
    PrimaryKey,
    Default(DataType.UUIDV4),
    Column(DataType.UUID),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    AllowNull(false),
    Column(DataType.STRING),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    AllowNull(false),
    Unique,
    Column({
        type: DataType.STRING,
        validate: { isEmail: true },
    }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    AllowNull(false),
    Column(DataType.STRING),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    CreatedAt,
    Column({ field: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    UpdatedAt,
    Column({ field: 'updated_at' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    DeletedAt,
    Column({ field: 'deleted_at' }),
    __metadata("design:type", Date)
], User.prototype, "deletedAt", void 0);
__decorate([
    HasMany(() => Event),
    __metadata("design:type", Array)
], User.prototype, "events", void 0);
__decorate([
    BeforeCreate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", Promise)
], User, "hashPassword", null);
User = __decorate([
    Table({
        tableName: 'Users',
        paranoid: true,
        timestamps: true,
    })
], User);
export { User };
