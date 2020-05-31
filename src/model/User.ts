import {
    Column,
    DataType,
    IsNumeric,
    Model,
    PrimaryKey,
    Table,
    IsEmail,
    IsDate, NotEmpty
} from 'sequelize-typescript';

@Table({
    tableName: 'user',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
})
export class User extends Model<User> {

    @PrimaryKey
    @IsNumeric
    @Column({
        allowNull: false,
        autoIncrement: true,
        type: DataType.INTEGER.UNSIGNED
    })
    user_id!: number;

    @NotEmpty
    @Column({
        allowNull: false,
        type: DataType.STRING
    })
    first_name!: string;

    @NotEmpty
    @Column({
        allowNull: false,
        type: DataType.STRING
    })
    last_name!: string;

    @IsEmail
    @Column({
        allowNull: false,
        type: DataType.STRING
    })
    email!: string;

    @Column({
        allowNull: true,
        type: DataType.STRING
    })
    country!: string;

    @Column({
        allowNull: true,
        type: DataType.STRING
    })
    city!: string;

    @IsDate
    @Column({
        allowNull: true,
        type: DataType.DATE,
    })
    birth_date!: Date;

}