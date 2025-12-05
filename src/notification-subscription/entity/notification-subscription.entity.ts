import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('notification_subscriptions')
export class NotificationSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  // El URL único que usa el navegador para escuchar los mensajes.
  @Column({ unique: true })
  endpoint: string;

  // Llave pública generada por el navegador.
  @Column()
  p256dh: string;

  // Token de autenticación generado por el navegador.
  @Column()
  auth: string;

  // Opcional: Para saber a qué usuario pertenece esta suscripción
  @Column()
  userId: number;
}
