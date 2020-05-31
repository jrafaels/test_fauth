import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey, IsAlpha, IsDate,
    IsNumeric,
    Model,
    NotEmpty, NotNull,
    PrimaryKey,
    Table
} from 'sequelize-typescript';
import {User} from './User';

@Table({
    tableName: 'token_expired',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})
export class TokenExpired extends Model<TokenExpired> {

    @PrimaryKey
    @IsNumeric
    @Column({
        allowNull: false,
        autoIncrement: true,
        type: DataType.INTEGER.UNSIGNED
    })
    token_id!: number;

    @ForeignKey(() => User)
    @IsNumeric
    @NotEmpty
    @Column({
        allowNull: false,
        type: DataType.INTEGER.UNSIGNED
    })
    user_id!: number;

    @NotEmpty
    @NotNull
    @Column({
        allowNull: false,
        type: DataType.TEXT,

    })
    text!: string;

    @IsAlpha
    @NotNull
    @Column({
        allowNull: false,
        type: DataType.STRING
    })
    type!: string;

    @IsDate
    @Column({
        allowNull: true,
        type: DataType.DATE
    })
    end_date!: Date;

    @BelongsTo(() => User)
    user!: User;

}