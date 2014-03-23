class ActorsController < ApplicationController
  def index
    MyLight.alert = "select"
    @color = params[:color] || "no color"
  end

  def show
    MyLight.alert = "select"
    @color = params[:color] || "no color"
  end
end
