Rails.application.routes.draw do
  get 'tarheel/launch' => 'tarheel#launch'
  get 'tarheel/book' => 'tarheel#book'
  
  get 'fandango/launch' => 'fandango#launch'
  get 'fandango/movies' => 'fandango#movies'
  get 'fandango/theaters' => 'fandango#theaters'
  get 'fandango/showtimes' => 'fandango#showtimes'
end