mod i18n;

use crossterm::{
    event::{self, DisableMouseCapture, EnableMouseCapture, Event, KeyCode},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{
    backend::{Backend, CrosstermBackend},
    layout::{Constraint, Direction, Layout},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, List, ListItem, Paragraph},
    Terminal,
};
use std::{error::Error, io};
use mcclean_core::{scan_system, ScanResult};

struct App {
    items: Vec<String>,
    scanning: bool,
    status: String,
    lang: i18n::Language,
}

impl App {
    fn new() -> App {
        let lang = i18n::Language::current();
        App {
            items: Vec::new(),
            scanning: false,
            status: i18n::t("status_idle", &lang).to_string(),
            lang,
        }
    }
}

fn main() -> Result<(), Box<dyn Error>> {
    // setup terminal
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen, EnableMouseCapture)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    // create app and run it
    let app = App::new();
    let res = run_app(&mut terminal, app);

    // restore terminal
    disable_raw_mode()?;
    execute!(
        terminal.backend_mut(),
        LeaveAlternateScreen,
        DisableMouseCapture
    )?;
    terminal.show_cursor()?;

    if let Err(err) = res {
        println!("{:?}", err);
    }

    Ok(())
}

fn run_app<B: Backend>(terminal: &mut Terminal<B>, mut app: App) -> io::Result<()> {
    loop {
        terminal.draw(|f| ui(f, &app))?;

        if let Event::Key(key) = event::read()? {
            match key.code {
                KeyCode::Char('q') => return Ok(()),
                KeyCode::Char('s') => {
                        if !app.scanning {
                            app.scanning = true;
                            app.status = i18n::t("status_scanning", &app.lang).to_string();
                            
                            terminal.draw(|f| ui(f, &app))?;

                            let results = scan_system(|_current_file, _items_processed| {
                                // Can't easily update UI from inside without threads/channels,
                                // but this is a simple port.
                            });

                            match results {
                                Ok(res) => {
                                    app.scanning = false;
                                    let base_done = i18n::t("status_done", &app.lang);
                                    app.status = base_done.replace("{}", &res.len().to_string());
                                    app.items.clear();
                                    for r in res {
                                        app.items.push(format!("{} ({} {})", r.name, r.size, i18n::t("bytes", &app.lang)));
                                    }
                                }
                                Err(e) => {
                                    app.scanning = false;
                                    let base_err = i18n::t("status_error", &app.lang);
                                    app.status = base_err.replace("{}", &e.to_string());
                                }
                            }
                        }
                }
                _ => {}
            }
        }
    }
}

fn ui(f: &mut ratatui::Frame, app: &App) {
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .margin(1)
        .constraints(
            [
                Constraint::Length(3),
                Constraint::Length(3),
                Constraint::Min(0),
            ]
            .as_ref(),
        )
        .split(f.size());

    let title = Paragraph::new(Span::styled(
        "McClean TUI",
        Style::default().fg(Color::Magenta).add_modifier(Modifier::BOLD),
    ))
    .block(Block::default().borders(Borders::ALL));
    f.render_widget(title, chunks[0]);

    let status = Paragraph::new(app.status.clone())
        .block(Block::default().borders(Borders::ALL));
    f.render_widget(status, chunks[1]);

    let items: Vec<ListItem> = app
        .items
        .iter()
        .map(|i| {
            ListItem::new(Line::from(vec![Span::raw(i)]))
        })
        .collect();

    let list = List::new(items).block(Block::default().title(i18n::t("results_title", &app.lang)).borders(Borders::ALL));
    f.render_widget(list, chunks[2]);
}
