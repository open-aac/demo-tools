Rails.application.routes.draw do
  root 'states#index'
  get 'tarheel/launch' => 'tarheel#launch'
  get 'tarheel/book' => 'tarheel#book'
  
  get 'fandango/launch' => 'fandango#launch'
  get 'fandango/movies' => 'fandango#movies'
  get 'fandango/theaters' => 'fandango#theaters'
  get 'fandango/showtimes' => 'fandango#showtimes'
  
  get 'states/:code' => 'states#show'
  post 'states/:code' => 'states#update'
  
  get 'calc/launch' => 'misc#calc'
end