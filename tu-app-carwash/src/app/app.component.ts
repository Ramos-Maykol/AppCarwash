import { 
    Component, 
    inject, 
    signal, 
    OnInit,
    ChangeDetectionStrategy 
} from '@angular/core';
import { 
    HttpClient, 
    HttpClientModule, 
    HttpErrorResponse 
} from '@angular/common/http';
import { 
    ReactiveFormsModule, 
    FormControl, 
    FormGroup, 
    Validators 
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

// --- SERVICIOS DE LA APLICACIÓN ---
// (En una app real, estarían en archivos separados)

/**
 * Servicio para manejar la autenticación
 */
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    // IMPORTANTE: Reemplaza esto con la URL de tu API de Laravel
    private apiUrl = 'http://127.0.0.1:8000/api'; 
    
    // Signal para almacenar la información del usuario
    currentUser = signal<any | null>(null);
    authToken = signal<string | null>(null);

    constructor() {
        // Al iniciar, intentar cargar el token desde localStorage
        const token = localStorage.getItem('auth_token');
        if (token) {
            this.authToken.set(token);
            // (En una app real, también deberías cargar los datos del /api/user)
        }
    }

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData).pipe(
            tap((res: any) => this.setAuth(res)),
            catchError(this.handleError)
        );
    }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((res: any) => this.setAuth(res)),
            catchError(this.handleError)
        );
    }

    logout() {
        // En una app real, llamarías a /api/logout si tienes el token
        // Por ahora, solo limpiamos el estado local
        localStorage.removeItem('auth_token');
        this.currentUser.set(null);
        this.authToken.set(null);
        return of(true); // Devuelve un observable de éxito
    }

    private setAuth(res: any) {
        localStorage.setItem('auth_token', res.token);
        this.authToken.set(res.token);
        if (res.user) {
            this.currentUser.set(res.user);
        }
    }

    private handleError(error: HttpErrorResponse) {
        console.error('Error en AuthService:', error.message);
        let userMessage = 'Ocurrió un error. Por favor, intenta de nuevo.';
        if (error.status === 401) {
            userMessage = 'Credenciales inválidas.';
        }
        if (error.status === 422 && error.error.errors) {
            // Manejo de errores de validación de Laravel
            userMessage = Object.values(error.error.errors).join('\n');
        }
        return throwError(() => new Error(userMessage));
    }
}

/**
 * Servicio para manejar los datos de Servicios
 */
@Injectable({
    providedIn: 'root'
})
export class ServicioService {
    private http = inject(HttpClient);
    private apiUrl = 'http://127.0.0.1:8000/api';

    getServicios(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/servicios`).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse) {
        console.error('Error en ServicioService:', error.message);
        return throwError(() => new Error('No se pudieron cargar los servicios.'));
    }
}


// --- COMPONENTE PRINCIPAL DE LA APP ---

@Component({
    selector: 'app-root',
    standalone: true,
    // Importamos los módulos necesarios para que Angular funcione
    imports: [
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule
    ],
    template: `
    <div class="font-sans antialiased text-gray-900 bg-gray-100 min-h-screen">
        
        <!-- Encabezado Fijo -->
        <header class="bg-blue-600 text-white p-4 shadow-md fixed top-0 left-0 right-0 z-10">
            <div class="container mx-auto flex justify-between items-center max-w-4xl px-4">
                <h1 class="text-2xl font-bold">Carwash App</h1>
                <nav class="flex gap-4">
                    @if (!authService.authToken()) {
                        <button (click)="page.set('login')" [class.font-bold]="page() === 'login'" class="hover:text-blue-200">Login</button>
                        <button (click)="page.set('register')" [class.font-bold]="page() === 'register'" class="hover:text-blue-200">Registro</button>
                    }
                    <button (click)="page.set('servicios')" [class.font-bold]="page() === 'servicios'" class="hover:text-blue-200">Servicios</button>
                    @if (authService.authToken()) {
                        <button (click)="onLogout()" class="hover:text-blue-200">Logout</button>
                    }
                </nav>
            </div>
        </header>

        <!-- Contenido Principal (con padding por el header fijo) -->
        <main class="pt-20 container mx-auto max-w-4xl p-4">
            
            <!-- Cambiador de Página -->
            @switch (page()) {

                <!-- PÁGINA DE LOGIN -->
                @case ('login') {
                    <div class="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
                        <h2 class="text-3xl font-bold mb-6 text-center text-blue-600">Iniciar Sesión</h2>
                        <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
                            <div class="mb-4">
                                <label for="login-email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input id="login-email" type="email" formControlName="email" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div class="mb-6">
                                <label for="login-password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                                <input id="login-password" type="password" formControlName="password" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <button type="submit" [disabled]="loginForm.invalid" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
                                Entrar
                            </button>
                        </form>
                    </div>
                }

                <!-- PÁGINA DE REGISTRO -->
                @case ('register') {
                    <div class="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
                        <h2 class="text-3xl font-bold mb-6 text-center text-blue-600">Crear Cuenta</h2>
                        <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
                            <div class="grid grid-cols-2 gap-4">
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input type="text" formControlName="nombre" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                </div>
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                                    <input type="text" formControlName="apellido" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                </div>
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" formControlName="email" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input type="tel" formControlName="telefono" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                                <input type="password" formControlName="password" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div class="mb-6">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                                <input type="password" formControlName="password_confirmation" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <button type="submit" [disabled]="registerForm.invalid" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50">
                                Registrarme
                            </button>
                        </form>
                    </div>
                }

                <!-- PÁGINA DE SERVICIOS -->
                @case ('servicios') {
                    <div class="bg-white p-8 rounded-lg shadow-lg">
                        <h2 class="text-3xl font-bold mb-6 text-blue-600">Nuestros Servicios</h2>
                        
                        @if (servicios().length === 0) {
                            <p class="text-gray-600">Cargando servicios...</p>
                        } @else {
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                @for (servicio of servicios(); track servicio.id) {
                                    <div class="border border-gray-200 rounded-lg p-6 shadow-sm">
                                        <h3 class="text-xl font-semibold mb-2">{{ servicio.nombre }}</h3>
                                        <p class="text-gray-700 mb-4">{{ servicio.descripcion }}</p>
                                        <h4 class="text-md font-semibold mb-2">Precios:</h4>
                                        <ul class="list-disc list-inside text-gray-600">
                                            @for (precio of servicio.precios; track precio.id) {
                                                <li>
                                                    <span class="font-medium">{{ precio.tipo_vehiculo.nombre }}:</span> S/ {{ precio.precio }}
                                                </li>
                                            }
                                        </ul>
                                    </div>
                                }
                            </div>
                        }
                    </div>
                }
            }

            <!-- Mostrar errores -->
            @if (errorMsg()) {
                <div class="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
                    <h4 class="font-bold mb-1">Error</h4>
                    <p class="text-sm">{{ errorMsg() }}</l>
                    <button (click)="errorMsg.set(null)" class="absolute top-2 right-2 text-xl">&times;</button>
                </div>
            }

        </main>
    </div>
    `,
    // Estilos CSS para la aplicación
    styles: [`
        /* Estilos globales (Tailwind se encarga de la mayoría) */
        body {
            margin: 0;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
    // --- Inyección de Servicios ---
    // Inyectamos los servicios que definimos arriba
    authService = inject(AuthService);
    private servicioService = inject(ServicioService);

    // --- Signals (Estado de la App) ---
    // Signal para controlar qué "página" se muestra
    page = signal<'login' | 'register' | 'servicios'>('servicios');
    // Signal para almacenar la lista de servicios
    servicios = signal<any[]>([]);
    // Signal para mostrar mensajes de error
    errorMsg = signal<string | null>(null);

    // --- Formularios Reactivos ---
    loginForm = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required]),
    });

    registerForm = new FormGroup({
        nombre: new FormControl('', [Validators.required]),
        apellido: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        telefono: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required, Validators.minLength(8)]),
        password_confirmation: new FormControl('', [Validators.required]),
    });

    ngOnInit() {
        // Al iniciar el componente, cargamos los servicios
        this.loadServicios();
    }

    loadServicios() {
        this.errorMsg.set(null);
        this.servicioService.getServicios().subscribe({
            next: (data) => {
                this.servicios.set(data);
                console.log('Servicios cargados:', data);
            },
            error: (err) => this.errorMsg.set(err.message)
        });
    }

    onLogin() {
        if (this.loginForm.invalid) return;
        this.errorMsg.set(null);

        this.authService.login(this.loginForm.value).subscribe({
            next: (res) => {
                console.log('Login exitoso:', res);
                this.page.set('servicios'); // Redirigir a servicios después del login
            },
            error: (err) => this.errorMsg.set(err.message)
        });
    }

    onRegister() {
        if (this.registerForm.invalid) return;
        this.errorMsg.set(null);
        
        // Comprobar si las contraseñas coinciden (Validación simple)
        if (this.registerForm.value.password !== this.registerForm.value.password_confirmation) {
            this.errorMsg.set('Las contraseñas no coinciden.');
            return;
        }

        this.authService.register(this.registerForm.value).subscribe({
            next: (res) => {
                console.log('Registro exitoso:', res);
                this.page.set('servicios'); // Redirigir a servicios después del registro
            },
            error: (err) => this.errorMsg.set(err.message)
        });
    }

    onLogout() {
        this.authService.logout().subscribe(() => {
            this.page.set('login'); // Redirigir a login después de cerrar sesión
        });
    }
}
