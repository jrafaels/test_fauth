import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey, IsAlpha,
    IsDate,
    IsNumeric,
    Model, NotEmpty,
    PrimaryKey,
    Table
} from 'sequelize-typescript';
import {User} from './User';

@Table({
    tableName: 'password',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})
export class Password extends Model<Password> {

    @PrimaryKey
    @IsNumeric
    @Column({
        allowNull: false,
        autoIncrement: true,
        type: DataType.INTEGER.UNSIGNED
    })
    password_id!: number;

    @NotEmpty
    @Column({
        allowNull: false,
        type: DataType.STRING
    })
    password!: string;

    @IsDate
    @Column({
        allowNull: false,
        type: DataType.DATE
    })
    start_date!: Date;

    @IsDate
    @Column({
        allowNull: true,
        type: DataType.DATE
    })
    end_date!: Date;

    @IsAlpha
    @NotEmpty
    @Column({
        allowNull: false,
        type: DataType.STRING
    })
    type!: string;

    @ForeignKey(() => User)
    @IsNumeric
    @Column({
        allowNull: false,
        type: DataType.INTEGER.UNSIGNED
    })
    user_id!: number;

    @BelongsTo(() => User)
    user!: User;

}