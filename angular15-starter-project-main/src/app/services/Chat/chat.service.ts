import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Client, IMessage, Frame } from '@stomp/stompjs';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
declare global {
  interface Window { SockJS: any }
}

import * as SockJS from 'sockjs-client';
import { environment } from 'src/environnement';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private client: Client;
  private apiUrl = `${environment.apiUrl}/chat`;
  private wsUrl = `${environment.websocketUrl}`; // e.g. http://localhost:8080/ws
  private messagesSubject = new Subject<any>();
  private notificationSubject = new Subject<any>();
  private listeners: Array<(message: any) => void> = [];
  private globalListeners: Array<(message: any) => void> = [];
  private activeChatMatriculeSubject = new BehaviorSubject<string | null>(null);
  public activeChatMatricule$ = this.activeChatMatriculeSubject.asObservable();

  private isConnected = false;

  constructor(private http: HttpClient) {
    this.client = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      reconnectDelay: 5000,
      debug: (str) => console.log('[STOMP DEBUG] ', str),
      onStompError: (frame: Frame) => console.error('Erreur STOMP :', frame.headers['message'], frame.body)
    });
  }

  public setActiveChatMatricule(matricule: string | null): void {
    this.activeChatMatriculeSubject.next(matricule);
  }

  public getActiveChatMatricule(): string | null {
    return this.activeChatMatriculeSubject.value;
  }

  public onMessage(callback: (message: any) => void): void {
    this.listeners.push(callback);
  }

  public onGlobalMessage(callback: (message: any) => void): void {
    this.globalListeners.push(callback);
  }

  private handleIncomingMessage(message: any): void {
    this.listeners.forEach(cb => cb(message));
    this.globalListeners.forEach(cb => cb(message));
  }

  public connect(matricule: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      this.client.onConnect = () => {
        this.isConnected = true;
        this.subscribeToMessages(matricule);
        console.log(`Connecté au WebSocket avec matricule ${matricule}`);
        resolve();
      };

      this.client.onWebSocketClose = (event) => {
        console.warn('WebSocket fermé', event);
        this.isConnected = false;
      };

      this.client.onStompError = (frame) => {
        console.error('Erreur STOMP', frame);
        reject(frame);
      };

      this.client.activate();
    });
  }

  public disconnect(): void {
    if (this.isConnected) {
      this.client.deactivate();
      this.isConnected = false;
    }
  }

  private subscribeToMessages(matricule: string): void {
    this.client.subscribe(`/topic/chat/${matricule}`, (message) => {
      if (message.body) {
        const msg = JSON.parse(message.body);
        this.handleIncomingMessage(msg);
        this.messagesSubject.next(msg);
        this.notificationSubject.next(msg);
      }
    });
  }

  public sendMessage(chat: { senderMatricule: string; receiverMatricule: string; message: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, chat);
  }

  public get realTimeMessages(): Observable<any> {
    return this.messagesSubject.asObservable();
  }

  public getMessages(senderMatricule: string, receiverMatricule: string): Observable<any[]> {
    const payload = { senderMatricule, receiverMatricule };
    return this.http.post<any[]>(`${this.apiUrl}/messages`, payload);
  }

  public clearMessagesBetweenAdminAndUser(senderMatricule: string, receiverMatricule: string): Observable<void> {
    const payload = { senderMatricule, receiverMatricule };
    return this.http.request<void>('delete', `${this.apiUrl}/messages`, { body: payload });
  }
}
