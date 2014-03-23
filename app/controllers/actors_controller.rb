require 'pp'

class ActorsController < ApplicationController
  def index
    rgb = params[:color][2..7] if params[:color]
    r = rgb[0..1].hex
    g = rgb[2..3].hex
    b = rgb[4..5].hex
    p r, g, b
    hsv = rgb_to_hsv(r, g, b)
    p hsv
    MyLight.on = true
    MyLight.hue = hsv
    #MyLight.alert = "select"
    MyLight.on = false
  end

  private
  # @param r [Integer] red 0..255
  # @param g [Integer] green 0..255
  # @param b [Integer] blue 0..255
  # @return [Integer[]] [hue, saturation, value]
  #   hue 0..360 degree
  #   saturation 0..100 %
  #   value 0..100 %
  def rgb_to_hsv r, g, b
    r /= 255.0
    g /= 255.0
    b /= 255.0
    cmax = [r, g, b].max
    cmin = [r, b, g].min
    d = cmax - cmin
    return [0, 0, (cmax * 100).floor] if d == 0
    h = case cmax
        when r then 60 * ((g - b) / d % 6)
        when g then 60 * ((b - r) / d + 2)
        else        60 * ((r - g) / d + 4)
        end
    hsv = [ h,
      d / cmax * 100,
      cmax * 100
    ].map &:floor

    r = hsv[0]
    g = hsv[1]
    b = hsv[2]
    r << 8 | g << 4 | b
  end
end
