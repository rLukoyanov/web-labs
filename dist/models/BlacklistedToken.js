var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Table, Column, Model, DataType, PrimaryKey, AllowNull, CreatedAt, UpdatedAt, BeforeCreate, } from 'sequelize-typescript';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
/**
 * @openapi
 * components:
 *   schemas:
 *     BlacklistedToken:
 *       type: object
 *       required:
 *         - token
 *         - expiresAt
 *       properties:
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           example: "2025-04-14T12:00:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
let BlacklistedToken = class BlacklistedToken extends Model {
    static setExpiration(instance) {
        try {
            const decoded = jwt.verify(instance.token, process.env.JWT_SECRET || '');
            if (decoded.exp) {
                instance.expiresAt = new Date(decoded.exp * 1000);
            }
            else {
                instance.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            }
        }
        catch {
            instance.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }
    }
};
__decorate([
    PrimaryKey,
    AllowNull(false),
    Column(DataType.STRING(512)),
    __metadata("design:type", String)
], BlacklistedToken.prototype, "token", void 0);
__decorate([
    AllowNull(false),
    Column(DataType.DATE),
    __metadata("design:type", Date)
], BlacklistedToken.prototype, "expiresAt", void 0);
__decorate([
    CreatedAt,
    Column({ field: 'created_at' }),
    __metadata("design:type", Date)
], BlacklistedToken.prototype, "createdAt", void 0);
__decorate([
    UpdatedAt,
    Column({ field: 'updated_at' }),
    __metadata("design:type", Date)
], BlacklistedToken.prototype, "updatedAt", void 0);
__decorate([
    BeforeCreate,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BlacklistedToken]),
    __metadata("design:returntype", void 0)
], BlacklistedToken, "setExpiration", null);
BlacklistedToken = __decorate([
    Table({
        tableName: 'BlacklistedTokens',
        timestamps: true,
    })
], BlacklistedToken);
export { BlacklistedToken };
