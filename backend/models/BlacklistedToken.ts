import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AllowNull,
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
 *         - expires_at
 *       properties:
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         expires_at:
 *           type: string
 *           format: date-time
 *           example: "2025-04-14T12:00:00Z"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

@Table({
  tableName: 'BlacklistedTokens',
  timestamps: true,
})
export class BlacklistedToken extends Model {
  @Column({
    type: DataType.STRING(512),
    primaryKey: true,
    allowNull: false,
  })
  declare token: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare expires_at: Date;

  @Column({
    field: 'created_at',
  })
  declare created_at: Date;

  @Column({
    field: 'updated_at',
  })
  declare updated_at: Date;

  @BeforeCreate
  static setExpiration(instance: BlacklistedToken): void {
    try {
      const decoded = jwt.verify(
        instance.token,
        process.env.JWT_SECRET || '',
      ) as JwtPayload;

      if (decoded.exp) {
        instance.expires_at = new Date(decoded.exp * 1000);
      } else {
        instance.expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
    } catch {
      instance.expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }

  static associate(): void {
    // No associations needed for BlacklistedToken
  }
}
