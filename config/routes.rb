Rails.application.routes.draw do
  get 'tarheel/launch' => 'tarheel#launch'
  get 'tarheel/book' => 'tarheel#book'
  
  get 'fandango/launch' => 'fandango#launch'
  post 'fandango/movies' => 'fandango#movies'
  post 'fandango/theaters' => 'fandango#theaters'
  post 'fandango/showtimes' => 'fandango#showtimes'
end