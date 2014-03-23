hue = Hue::Client.new
bridge = hue.bridges.find{|obj| obj.ip == '192.168.1.210'}
MyLight = bridge.lights[1]
