import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-2xl px-4 py-10">
      <a routerLink="/" class="text-sm text-brand-600 hover:underline">← Inicio</a>
      <h1 class="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{{ title }}</h1>
      <div class="card prose-markdown mt-6 space-y-4 p-6 text-sm text-slate-700 dark:text-slate-300">
        @for (p of paragraphs; track p) {
          <p>{{ p }}</p>
        }
      </div>
    </div>
  `,
})
export class LegalPage {
  private readonly route = inject(ActivatedRoute);
  title = '';
  paragraphs: string[] = [];

  constructor() {
    const page = this.route.snapshot.data['page'] as string;
    if (page === 'privacy') {
      this.title = 'Política de privacidad';
      this.paragraphs = [
        'Recopilamos nombre, email y contenido que publicas en el foro para operar el servicio.',
        'Si usas Google OAuth, recibimos datos básicos de perfil según los permisos que autorices.',
        'Las imágenes de avatar y banner se almacenan en el servidor de la aplicación.',
        'Puedes solicitar la eliminación de tu cuenta desde Ajustes en tu perfil.',
        'Contacto: demo@foro.test para consultas sobre tus datos.',
      ];
    } else {
      this.title = 'Términos de uso';
      this.paragraphs = [
        'Al usar Foro Comunidad aceptas publicar contenido respetuoso y legal.',
        'Los administradores pueden moderar hilos, suspender cuentas y resolver reportes.',
        'El karma y las votaciones son indicadores comunitarios, sin valor monetario.',
        'No nos hacemos responsables de opiniones de terceros publicadas por usuarios.',
        'Podemos actualizar estos términos; el uso continuado implica aceptación.',
      ];
    }
  }
}

