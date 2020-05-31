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
    tableName: 'log',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})
export class Log extends Model<Log> {

    @PrimaryKey
    @IsNumeric
    @Column({
        allowNull: false,
        autoIncrement: true,
        type: DataType.INTEGER.UNSIGNED
    })
    log_id!: number;

    @ForeignKey(() => User)
    @IsNumeric
    @Column({
        allowNull: false,
        type: DataType.INTEGER.UNSIGNED
    })
    user_id!: number;

    @IsDate
    @Column({
        allowNull: false,
        type: DataType.DATE
    })
    time!: Date;

    @IsAlpha
    @NotEmpty
    @Column({
        allowNull: false,
        type: DataType.STRING
    })
    type!: string;

    @NotEmpty
    @Column({
        allowNull: false,
        type: DataType.STRING
    })
    ip!: string;

    @NotEmpty
    @Column({
        allowNull: false,
        type: DataType.STRING
    })
    description!: string;

    @BelongsTo(() => User)
    user!: User;

}