import { Confederation } from 'src/api/confederations/entities/confederation.entity';
import { Match } from 'src/api/matches/entities/match.entity';
import { EntityBase } from 'src/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('teams')
export class Team extends EntityBase {
  @Column()
  name: string;

  @Column({ nullable: true, default: null })
  logoUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  confederationId: number;

  @ManyToOne(() => Confederation, (confederation) => confederation.teams)
  @JoinColumn({ name: 'confederationId' })
  confederation: Confederation;

  @OneToMany(() => Match, (match) => match.homeTeam)
  homeMatches: Match[];

  @OneToMany(() => Match, (match) => match.awayTeam)
  awayMatches: Match[];
}
