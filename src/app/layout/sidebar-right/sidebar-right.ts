import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../shared/services/supabase';

@Component({
  selector: 'app-sidebar-right',
  imports: [RouterLink],
  templateUrl: './sidebar-right.html',
  styleUrl: './sidebar-right.css',
})
export class SidebarRight implements OnInit {
  private supabase = inject(SupabaseService);

  upcomingEvents: any[] = [];

  ngOnInit() {
    this.fetchUpcoming();
  }

  async fetchUpcoming() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(5);

    if (data) {
      this.upcomingEvents = data.map(evt => {
        const isToday = evt.date === today;
        const dateObj = new Date(evt.date);
        const formattedDate = dateObj.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });

        let color = 'blue';
        let icon = 'pi-calendar';

        switch (evt.type) {
          case 'ag': color = 'green'; icon = 'pi-users'; break;
          case 'personal': color = 'purple'; icon = 'pi-user'; break;
          case 'general': color = 'blue'; icon = 'pi-flag'; break;
        }

        return {
          title: evt.title,
          date: isToday ? 'Heute' : formattedDate,
          time: evt.start_time,
          type: evt.type,
          icon: icon,
          color: color
        };
      });
    }
  }

  tasks = [
    { id: 1, title: 'Protokoll hochladen', done: false },
    { id: 2, title: 'Antrag #42 prüfen', done: true },
    { id: 3, title: 'Raum buchen', done: false }
  ];

  toggleTask(task: any) {
    task.done = !task.done;
  }
}
