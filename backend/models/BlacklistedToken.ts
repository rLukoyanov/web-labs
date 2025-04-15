import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  BeforeCreate,
} from 'sequelize-typescript';
import jwt, { JwtPayload } from 'jsonwebtoken';
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

@Table({
  tableName: 'BlacklistedTokens',
  timestamps: true,
})
export class BlacklistedToken extends Model<BlacklistedToken> {
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.STRING(512))
  token!: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  expiresAt!: Date;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt!: Date;

  @BeforeCreate
  static setExpiration(instance: BlacklistedToken): void {
    try {
      const decoded = jwt.verify(
        instance.token,
        process.env.JWT_SECRET || '',
      ) as JwtPayload;

      if (decoded.exp) {
        instance.expiresAt = new Date(decoded.exp * 1000);
      } else {
        instance.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
    } catch {
      instance.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }
}
