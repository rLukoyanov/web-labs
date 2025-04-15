var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, CreatedAt, UpdatedAt, DeletedAt, } from 'sequelize-typescript';
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
let Event = class Event extends Model {
};
__decorate([
    PrimaryKey,
    Default(DataType.UUIDV4),
    Column(DataType.UUID),
    __metadata("design:type", String)
], Event.prototype, "id", void 0);
__decorate([
    Column(DataType.STRING),
    __metadata("design:type", String)
], Event.prototype, "title", void 0);
__decorate([
    Column(DataType.TEXT),
    __metadata("design:type", String)
], Event.prototype, "description", void 0);
__decorate([
    Column(DataType.DATE),
    __metadata("design:type", Date)
], Event.prototype, "date", void 0);
__decorate([
    ForeignKey(() => User),
    Column(DataType.UUID),
    __metadata("design:type", String)
], Event.prototype, "createdBy", void 0);
__decorate([
    BelongsTo(() => User, 'createdBy'),
    __metadata("design:type", User)
], Event.prototype, "user", void 0);
__decorate([
    CreatedAt,
    Column({ field: 'created_at' }),
    __metadata("design:type", Date)
], Event.prototype, "createdAt", void 0);
__decorate([
    UpdatedAt,
    Column({ field: 'updated_at' }),
    __metadata("design:type", Date)
], Event.prototype, "updatedAt", void 0);
__decorate([
    DeletedAt,
    Column({ field: 'deleted_at' }),
    __metadata("design:type", Date)
], Event.prototype, "deletedAt", void 0);
Event = __decorate([
    Table({
        tableName: 'Events',
        paranoid: true,
        timestamps: true,
    })
], Event);
export { Event };
