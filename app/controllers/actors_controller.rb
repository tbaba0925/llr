class ActorsController < ApplicationController
  def index
    MyLight.alert = "select"
    @color = params[:color]
  end
end
