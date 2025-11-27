import {
  Controller,
  Get,
  Render,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseGuard } from './auth/supabase.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './api/users/entities/user.entity';
import { UsersService } from './api/users/users.service';
import { TeamsService } from './api/teams/teams.service';
import { PoolsService } from './api/pools/pools.service';
import { MatchesService } from './api/matches/matches.service';
import { PredictionsService } from './api/predictions/predictions.service';
import { ConfederationsService } from './api/confederations/confederations.service';

@Controller('admin')
export class AdminController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly teamsService: TeamsService,
    private readonly poolsService: PoolsService,
    private readonly matchesService: MatchesService,
    private readonly predictionsService: PredictionsService,
    private readonly confederationsService: ConfederationsService,
  ) {}

  @Get()
  @Render('pages/admin/welcome')
  root() {
    return { title: 'Bienvenido a TecnoSports Admin' };
  }

  @Get('dashboard')
  @UseGuards(SupabaseGuard)
  @Render('pages/admin/dashboard')
  async dashboard(@Req() req) {
    const user = await this.checkAdminRole(req);
    const users = await this.usersService.findAll();
    const teams = await this.teamsService.findAll();
    const pools = await this.poolsService.findAll();
    const matches = await this.matchesService.findAll();

    return {
      title: 'Dashboard Admin - TecnoSports',
      currentPage: 'dashboard',
      user: user,
      totalUsers: users.data.length,
      totalTeams: teams.data.length,
      totalPools: pools.data.length,
      todayMatches: matches.data.length,
    };
  }

  @Get('users')
  @UseGuards(SupabaseGuard)
  @Render('pages/admin/users')
  async users(@Req() req) {
    const user = await this.checkAdminRole(req);
    const users = await this.usersService.findAll();
    return {
      title: 'Gestión de Usuarios - TecnoSports',
      currentPage: 'users',
      user: user,
      users: users.data,
    };
  }

  @Get('teams')
  @UseGuards(SupabaseGuard)
  @Render('pages/admin/teams')
  async teams(@Req() req) {
    const user = await this.checkAdminRole(req);
    const teams = await this.teamsService.findAll();
    const confederations = await this.confederationsService.findAll();
    return {
      title: 'Gestión de Equipos - TecnoSports',
      currentPage: 'teams',
      user: user,
      teams: teams.data,
      confederations: confederations.data,
    };
  }

  @Get('pools')
  @UseGuards(SupabaseGuard)
  @Render('pages/admin/pools')
  async pools(@Req() req) {
    const user = await this.checkAdminRole(req);
    const pools = await this.poolsService.findAll();
    return {
      title: 'Gestión de Quinelas - TecnoSports',
      currentPage: 'pools',
      user: user,
      pools: pools.data,
    };
  }

  @Get('matches')
  @UseGuards(SupabaseGuard)
  @Render('pages/admin/matches')
  async matches(@Req() req) {
    const user = await this.checkAdminRole(req);
    const matchesResult = await this.matchesService.findAll();
    const teamsResult = await this.teamsService.findAll();

    const teamsMap = new Map(
      teamsResult.data.map((team) => [team.id, team.name]),
    );

    const enrichedMatches = matchesResult.data.map((match) => ({
      ...match,
      homeTeamName: teamsMap.get(match.homeTeamId) || 'Unknown',
      awayTeamName: teamsMap.get(match.awayTeamId) || 'Unknown',
    }));

    return {
      title: 'Gestión de Partidos - TecnoSports',
      currentPage: 'matches',
      user: user,
      matches: enrichedMatches,
      teams: teamsResult.data, // Pass teams for the form dropdown
    };
  }

  @Get('predictions')
  @UseGuards(SupabaseGuard)
  @Render('pages/admin/predictions')
  async predictions(@Req() req) {
    const user = await this.checkAdminRole(req);
    const predictions = await this.predictionsService.findAll();
    return {
      title: 'Gestión de Predicciones - TecnoSports',
      currentPage: 'predictions',
      user: user,
      predictions: predictions.data,
    };
  }

  @Get('confederations')
  @UseGuards(SupabaseGuard)
  @Render('pages/admin/confederations')
  async confederations(@Req() req) {
    const user = await this.checkAdminRole(req);
    const confederations = await this.confederationsService.findAll();
    return {
      title: 'Gestión de Confederaciones - TecnoSports',
      currentPage: 'confederations',
      user: user,
      confederations: confederations.data,
    };
  }

  private async checkAdminRole(req: any): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { authUserId: req.user.authUserId },
    });

    if (!user || user.roleId !== 2) {
      throw new UnauthorizedException('Access denied. Admin role required.');
    }

    return user;
  }

  @Get('login')
  @Render('auth/login')
  login() {
    return {
      title: 'Login - TecnoSports Admin',
      layout: false,
    };
  }
}
