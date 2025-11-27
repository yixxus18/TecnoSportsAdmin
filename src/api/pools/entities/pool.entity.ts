import { Prediction } from 'src/api/predictions/entities/prediction.entity';
import { User } from 'src/api/users/entities/user.entity';
import { EntityBase } from 'src/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Pool extends EntityBase {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ unique: true, nullable: false })
  invitationCode: number;

  @Column()
  maxParticipants: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isClose: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true, default: null })
  endDate: Date;

  @Column({ nullable: false })
  creatorId: number;

  @ManyToOne(() => User, (user) => user.poolsCreated)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ManyToMany(() => User, (user) => user.pools)
  @JoinTable({
    name: 'pool_participants',
    joinColumn: { name: 'poolId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  participants: User[];

  @OneToMany(() => Prediction, (prediction) => prediction.pool)
  predictions: Prediction[];
}
